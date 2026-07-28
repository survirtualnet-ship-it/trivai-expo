import { normalizeCategory, type Category } from '@/lib/categories'
import { haversineKm } from '@/lib/eventUtils'
import {
  hasActiveDiscoverPreferences,
  type DiscoverPreferences,
} from '@/lib/discoverPreferences'
import type { ActivityCategoryProfile } from '@/lib/userActivity'

export type DiscoverRankingMode = 'default' | 'trending'

export const TRENDING_WINDOW_DAYS = 7

const RECENCY_HALF_LIFE_DAYS = 45

export interface PlaceRankingInput {
  rating_avg?: number | null
  rating_count?: number | null
  created_at?: string | null
  category?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface EventRankingInput {
  attendees_count?: number | null
  start_datetime: string
  created_at?: string | null
  is_featured?: boolean | null
  category?: string | null
  is_free?: boolean | null
  price?: number | null
  place?: { latitude?: number | null; longitude?: number | null } | null
}

const CATEGORY_PERSONALIZATION_BOOST = 1.8
const PRICE_PERSONALIZATION_BOOST = 1.4
const LOCATION_PERSONALIZATION_BOOST = 1.6
const DEFAULT_LOCATION_RADIUS_KM = 8

/** Max boost for places/events in the user's top interacted categories. */
const ACTIVITY_CATEGORY_BOOST_MAX = 2.2
/** Penalty for categories outside the user's interest profile (when signal is strong enough). */
const ACTIVITY_CATEGORY_PENALTY = 0.55
const ACTIVITY_PENALTY_MIN_SIGNALS = 4

/** Exponential decay: newer items get a small boost (1.0 → ~0.25 over ~45 days). */
export function recencyBoost(isoDate: string | null | undefined, now = Date.now()): number {
  if (!isoDate) return 0
  const ageDays = (now - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
  if (!Number.isFinite(ageDays) || ageDays < 0) return 0
  return Math.exp(-ageDays / RECENCY_HALF_LIFE_DAYS)
}

/**
 * Composite discover score for places:
 * rating (confidence-weighted) + review volume + recency + optional trending activity.
 */
export function computePlaceDiscoverScore(
  place: PlaceRankingInput,
  recentActivity = 0,
  mode: DiscoverRankingMode = 'default',
): number {
  const rating = Math.max(0, Math.min(5, place.rating_avg ?? 0))
  const reviews = Math.max(0, place.rating_count ?? 0)
  const recency = recencyBoost(place.created_at)

  const reviewConfidence = Math.min(reviews / 25, 1)
  const ratingScore = rating * (0.45 + 0.55 * reviewConfidence)
  const reviewVolumeScore = Math.log1p(reviews) * 0.9

  let score = ratingScore * 2.2 + reviewVolumeScore + recency * 1.1

  const activityWeight = mode === 'trending' ? 2.8 : 0.65
  score += Math.log1p(recentActivity) * activityWeight

  return score
}

/**
 * Composite discover score for events:
 * attendees + recency + upcoming urgency + optional trending RSVPs (last 7 days).
 */
export function computeEventDiscoverScore(
  event: EventRankingInput,
  recentActivity = 0,
  mode: DiscoverRankingMode = 'default',
): number {
  const attendees = Math.max(0, event.attendees_count ?? 0)
  const recency = recencyBoost(event.created_at)

  const daysUntil =
    (new Date(event.start_datetime).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  const urgencyBoost =
    daysUntil >= 0 && daysUntil <= 21 ? ((21 - daysUntil) / 21) * 0.9 : 0

  let score = Math.log1p(attendees) * 1.6 + recency * 0.9 + urgencyBoost
  if (event.is_featured) score += 2.5

  const activityWeight = mode === 'trending' ? 3.2 : 0.75
  score += Math.log1p(recentActivity) * activityWeight

  return score
}

export function sortByDiscoverScore<T>(items: T[], scoreFn: (item: T) => number): T[] {
  return [...items].sort((a, b) => scoreFn(b) - scoreFn(a))
}

export function trendingSinceIso(now = Date.now()): string {
  return new Date(now - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
}

function matchesPreferredCategory(
  itemCategory: string | null | undefined,
  preferred: Category[],
): boolean {
  if (!preferred.length || !itemCategory) return false
  return preferred.includes(normalizeCategory(itemCategory))
}

function matchesPreferredPriceRange(
  event: Pick<EventRankingInput, 'is_free' | 'price'>,
  priceMin: number | null,
  priceMax: number | null,
): boolean {
  if (priceMin == null && priceMax == null) return false
  const price = event.is_free ? 0 : Math.max(0, event.price ?? 0)
  if (priceMin != null && price < priceMin) return false
  if (priceMax != null && price > priceMax) return false
  return true
}

function resolvePreferenceCoords(
  prefs: DiscoverPreferences,
  liveCoords: { lat: number; lng: number } | null,
): { lat: number; lng: number } | null {
  const loc = prefs.location
  if (!loc) return liveCoords
  if (loc.lat != null && loc.lng != null) return { lat: loc.lat, lng: loc.lng }
  return liveCoords
}

function locationPersonalizationBoost(
  lat: number | null | undefined,
  lng: number | null | undefined,
  prefs: DiscoverPreferences,
  liveCoords: { lat: number; lng: number } | null,
): number {
  const ref = resolvePreferenceCoords(prefs, liveCoords)
  if (!ref || lat == null || lng == null) return 0

  const radius = prefs.location?.radiusKm ?? DEFAULT_LOCATION_RADIUS_KM
  const dist = haversineKm(ref.lat, ref.lng, lat, lng)
  if (dist > radius) return 0

  return LOCATION_PERSONALIZATION_BOOST * (1 - dist / radius)
}

/**
 * Boost/penalty from user_activity category affinity.
 * Returns 0 for new users or when profile is unavailable (no slowdown fallback).
 */
export function computeActivityCategoryAdjustment(
  category: string | null | undefined,
  profile: ActivityCategoryProfile | null,
): number {
  if (!profile || !category) return 0

  const cat = normalizeCategory(category)
  const affinity = profile.weights.get(cat)

  if (affinity != null) {
    return affinity * ACTIVITY_CATEGORY_BOOST_MAX
  }

  if (profile.totalSignals >= ACTIVITY_PENALTY_MIN_SIGNALS) {
    return -ACTIVITY_CATEGORY_PENALTY
  }

  return 0
}

/** Boost additive applied on top of the base discover score. Returns 0 for guests or empty prefs. */
export function computePlacePersonalizationBoost(
  place: PlaceRankingInput,
  prefs: DiscoverPreferences | null,
  liveCoords: { lat: number; lng: number } | null = null,
  activityProfile: ActivityCategoryProfile | null = null,
): number {
  let boost = computeActivityCategoryAdjustment(place.category, activityProfile)

  if (!prefs || !hasActiveDiscoverPreferences(prefs)) return boost

  if (matchesPreferredCategory(place.category, prefs.categories)) {
    boost += CATEGORY_PERSONALIZATION_BOOST
  }
  boost += locationPersonalizationBoost(
    place.latitude,
    place.longitude,
    prefs,
    liveCoords,
  )
  return boost
}

/** Boost additive applied on top of the base discover score. Returns 0 for guests or empty prefs. */
export function computeEventPersonalizationBoost(
  event: EventRankingInput,
  prefs: DiscoverPreferences | null,
  liveCoords: { lat: number; lng: number } | null = null,
  activityProfile: ActivityCategoryProfile | null = null,
): number {
  let boost = computeActivityCategoryAdjustment(event.category, activityProfile)

  if (!prefs || !hasActiveDiscoverPreferences(prefs)) return boost

  if (matchesPreferredCategory(event.category, prefs.categories)) {
    boost += CATEGORY_PERSONALIZATION_BOOST
  }
  if (matchesPreferredPriceRange(event, prefs.priceMin, prefs.priceMax)) {
    boost += PRICE_PERSONALIZATION_BOOST
  }
  boost += locationPersonalizationBoost(
    event.place?.latitude,
    event.place?.longitude,
    prefs,
    liveCoords,
  )
  return boost
}

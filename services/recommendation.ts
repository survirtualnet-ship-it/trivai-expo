/**
 * Trivai recommendation engine — heuristic scoring today, ML-ready tomorrow.
 *
 * Swap `HeuristicRecommendationScorer` for an ML scorer implementing
 * `RecommendationScorer` without changing call sites.
 */

import { normalizeCategory, type Category } from '@/lib/categories'
import { haversineKm } from '@/lib/eventUtils'
import type { Coords } from '@/lib/geolocation'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

// ─── Public types ────────────────────────────────────────────────────────────

export type UserProfile = {
  likedCategories: string[]
  viewedPlaces: string[]
  favorites: string[]
  /** Optional explicit ratings placeId → 1–5 */
  ratings?: Record<string, number>
}

/** Minimal place shape the engine needs (compatible with PlaceCardData). */
export type RecommendablePlace = {
  id: string
  name: string
  category: string
  rating_avg?: number | null
  rating_count?: number | null
  latitude?: number | null
  longitude?: number | null
  is_featured?: boolean | null
  is_sponsored?: boolean | null
}

export type RecommendationContext = {
  userCoords?: Coords | null
  /** Soft-exclude ids already consumed heavily (views/favorites) */
  excludeSeen?: boolean
  now?: number
}

export type ScoredRecommendation<T extends RecommendablePlace = RecommendablePlace> = {
  place: T
  score: number
  /** Human-readable breakdown for debugging / future explainability UI */
  reasons: string[]
  features: RecommendationFeatures
}

/**
 * Feature vector — keep stable so an ML model can train on the same keys later.
 * Values are roughly 0–1 unless noted.
 */
export type RecommendationFeatures = {
  categoryMatch: number
  rating: number
  popularity: number
  proximity: number
  favoriteAffinity: number
  viewPenalty: number
  featuredBoost: number
  ratingSignal: number
}

/** Pluggable scorer — replace heuristics with ML inference later. */
export interface RecommendationScorer {
  readonly name: string
  score(
    place: RecommendablePlace,
    profile: UserProfile,
    ctx: RecommendationContext,
  ): { score: number; reasons: string[]; features: RecommendationFeatures }
}

export type GetRecommendedPlacesOptions = {
  limit?: number
  coords?: Coords | null
  /** Soft-demote already viewed/favorited places (default true) */
  excludeSeen?: boolean
  scorer?: RecommendationScorer
}

// ─── Weights (tunable; mirror what an ML model would learn) ───────────────────

export const RECOMMENDATION_WEIGHTS = {
  categoryMatch: 3.2,
  rating: 2.4,
  popularity: 1.6,
  proximity: 2.0,
  favoriteAffinity: 1.4,
  viewPenalty: -1.8,
  featuredBoost: 0.8,
  ratingSignal: 2.0,
} as const

const MAX_PROXIMITY_KM = 12

// ─── Feature extraction (shared by heuristics + future ML) ───────────────────

export function extractRecommendationFeatures(
  place: RecommendablePlace,
  profile: UserProfile,
  ctx: RecommendationContext = {},
): RecommendationFeatures {
  const placeCat = normalizeCategory(place.category)
  const liked = new Set(
    profile.likedCategories.map(c => normalizeCategory(c)),
  )
  const favorites = new Set(profile.favorites)
  const viewed = new Set(profile.viewedPlaces)

  const categoryMatch = liked.size === 0
    ? 0.35 // cold-start: mild prior
    : liked.has(placeCat)
      ? 1
      : 0

  const ratingRaw = Math.max(0, Math.min(5, place.rating_avg ?? 0)) / 5
  const reviews = Math.max(0, place.rating_count ?? 0)
  const confidence = Math.min(reviews / 25, 1)
  const rating = ratingRaw * (0.4 + 0.6 * confidence)

  const popularity = Math.min(Math.log1p(reviews) / Math.log1p(200), 1)

  let proximity = 0.4 // unknown location → neutral
  if (
    ctx.userCoords
    && place.latitude != null
    && place.longitude != null
  ) {
    const km = haversineKm(
      ctx.userCoords.lat,
      ctx.userCoords.lng,
      place.latitude,
      place.longitude,
    )
    proximity = km > MAX_PROXIMITY_KM
      ? 0
      : 1 - km / MAX_PROXIMITY_KM
  }

  // Affinity: places similar to favorites (same category as a favorite)
  let favoriteAffinity = 0
  if (favorites.has(place.id)) {
    favoriteAffinity = 0 // will be penalized via viewPenalty / exclude
  } else if (liked.has(placeCat) && favorites.size > 0) {
    favoriteAffinity = 0.7
  }

  const alreadySeen = viewed.has(place.id) || favorites.has(place.id)
  const viewPenalty = alreadySeen && (ctx.excludeSeen !== false) ? 1 : 0

  const featuredBoost = place.is_featured ? 1 : place.is_sponsored ? 0.5 : 0

  const userRating = profile.ratings?.[place.id]
  const ratingSignal = userRating != null
    ? Math.max(0, Math.min(1, (userRating - 1) / 4))
    : 0

  return {
    categoryMatch,
    rating,
    popularity,
    proximity,
    favoriteAffinity,
    viewPenalty,
    featuredBoost,
    ratingSignal,
  }
}

function featuresToScore(
  features: RecommendationFeatures,
  weights = RECOMMENDATION_WEIGHTS,
): number {
  return (
    features.categoryMatch * weights.categoryMatch
    + features.rating * weights.rating
    + features.popularity * weights.popularity
    + features.proximity * weights.proximity
    + features.favoriteAffinity * weights.favoriteAffinity
    + features.viewPenalty * weights.viewPenalty
    + features.featuredBoost * weights.featuredBoost
    + features.ratingSignal * weights.ratingSignal
  )
}

function featuresToReasons(features: RecommendationFeatures, placeCat: string): string[] {
  const reasons: string[] = []
  if (features.categoryMatch >= 1) reasons.push(`Te gusta ${placeCat}`)
  if (features.rating >= 0.8) reasons.push('Muy bien valorado')
  if (features.popularity >= 0.6) reasons.push('Popular en la comunidad')
  if (features.proximity >= 0.7) reasons.push('Cerca de ti')
  if (features.featuredBoost >= 1) reasons.push('Destacado por Trivai')
  if (features.ratingSignal >= 0.75) reasons.push('Coincide con tus valoraciones')
  if (reasons.length === 0) reasons.push('Buena opción para descubrir')
  return reasons.slice(0, 3)
}

// ─── Scorers ─────────────────────────────────────────────────────────────────

/** Current production scorer — pure heuristics over stable features. */
export class HeuristicRecommendationScorer implements RecommendationScorer {
  readonly name = 'heuristic-v1'

  score(
    place: RecommendablePlace,
    profile: UserProfile,
    ctx: RecommendationContext = {},
  ) {
    const features = extractRecommendationFeatures(place, profile, ctx)
    const score = featuresToScore(features)
    const reasons = featuresToReasons(features, normalizeCategory(place.category))
    return { score, reasons, features }
  }
}

/**
 * Placeholder for a future ML model.
 * Call an API / local TFLite model, map outputs onto the same feature keys,
 * or replace `score()` entirely while keeping `getRecommendedPlaces` stable.
 */
export class MlRecommendationScorer implements RecommendationScorer {
  readonly name = 'ml-v0-stub'
  private fallback = new HeuristicRecommendationScorer()

  score(
    place: RecommendablePlace,
    profile: UserProfile,
    ctx: RecommendationContext = {},
  ) {
    // TODO: replace with model inference
    // const vector = extractRecommendationFeatures(place, profile, ctx)
    // return await mlClient.predict(vector)
    return this.fallback.score(place, profile, ctx)
  }
}

const defaultScorer = new HeuristicRecommendationScorer()

// ─── Main API ────────────────────────────────────────────────────────────────

/**
 * Rank candidate places for a user profile.
 *
 * @example
 * const ranked = getRecommendedPlaces(profile, allPlaces, { limit: 20, coords })
 */
export function getRecommendedPlaces<T extends RecommendablePlace>(
  userProfile: UserProfile,
  candidates: T[],
  options: GetRecommendedPlacesOptions = {},
): ScoredRecommendation<T>[] {
  const {
    limit = 20,
    coords = null,
    excludeSeen = true,
    scorer = defaultScorer,
  } = options

  const ctx: RecommendationContext = {
    userCoords: coords,
    excludeSeen,
  }

  const scored = candidates.map(place => {
    const { score, reasons, features } = scorer.score(place, userProfile, ctx)
    return { place, score, reasons, features }
  })

  scored.sort((a, b) => b.score - a.score)

  // Hard-filter exact favorites/views only when we still have enough results
  let result = scored
  if (excludeSeen) {
    const seen = new Set([...userProfile.viewedPlaces, ...userProfile.favorites])
    const filtered = scored.filter(s => !seen.has(s.place.id))
    if (filtered.length >= Math.min(limit, 4)) {
      result = filtered
    }
  }

  return result.slice(0, limit)
}

/** Convenience: return only place entities in ranked order. */
export function getRecommendedPlaceList<T extends RecommendablePlace>(
  userProfile: UserProfile,
  candidates: T[],
  options?: GetRecommendedPlacesOptions,
): T[] {
  return getRecommendedPlaces(userProfile, candidates, options).map(s => s.place)
}

// ─── Profile builders ────────────────────────────────────────────────────────

export function emptyUserProfile(): UserProfile {
  return {
    likedCategories: [],
    viewedPlaces: [],
    favorites: [],
    ratings: {},
  }
}

/**
 * Derive liked categories from favorites + viewed place cards.
 * Useful when you already have place objects in memory.
 */
export function buildUserProfile(input: {
  favorites?: PlaceCardData[]
  viewed?: PlaceCardData[]
  likedCategories?: string[]
  ratings?: Record<string, number>
}): UserProfile {
  const favoriteIds = (input.favorites ?? []).map(p => p.id)
  const viewedIds = (input.viewed ?? []).map(p => p.id)

  const categoryCounts = new Map<Category, number>()
  for (const p of [...(input.favorites ?? []), ...(input.viewed ?? [])]) {
    const cat = normalizeCategory(p.category)
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + (favoriteIds.includes(p.id) ? 3 : 1))
  }

  const derivedCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)

  const likedCategories = [
    ...(input.likedCategories ?? []).map(c => normalizeCategory(c)),
    ...derivedCategories,
  ]

  return {
    likedCategories: [...new Set(likedCategories)],
    viewedPlaces: [...new Set(viewedIds)],
    favorites: [...new Set(favoriteIds)],
    ratings: input.ratings ?? {},
  }
}

/** Merge profiles (e.g. local cache + server signals). */
export function mergeUserProfiles(...profiles: UserProfile[]): UserProfile {
  const liked = new Set<string>()
  const viewed = new Set<string>()
  const favorites = new Set<string>()
  const ratings: Record<string, number> = {}

  for (const p of profiles) {
    p.likedCategories.forEach(c => liked.add(normalizeCategory(c)))
    p.viewedPlaces.forEach(id => viewed.add(id))
    p.favorites.forEach(id => favorites.add(id))
    Object.assign(ratings, p.ratings ?? {})
  }

  return {
    likedCategories: [...liked],
    viewedPlaces: [...viewed],
    favorites: [...favorites],
    ratings,
  }
}

/** Cold-start profile — popular categories in Santa Cruz. */
export function coldStartUserProfile(): UserProfile {
  return {
    likedCategories: ['Gastronomía', 'Entretenimiento'],
    viewedPlaces: [],
    favorites: [],
  }
}

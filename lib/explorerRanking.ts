import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { Category } from '@/lib/categories'
import { normalizeCategory } from '@/lib/categories'
import {
  computePlaceDiscoverScore,
  computePlacePersonalizationBoost,
} from '@/lib/discoverRanking'
import { enrichAllPlaces, type EnrichedPlace } from '@/lib/discoverFilters'
import type { DiscoverPreferences } from '@/lib/discoverPreferences'
import type { ActivityCategoryProfile } from '@/lib/userActivity'
import type { Coords } from '@/lib/geolocation'
import { haversineKm } from '@/lib/eventUtils'
import {
  estimatePriceTier,
  type PriceTier,
} from '@/lib/explorerCategories'
import { buildExplorerRecommendation } from '@/lib/explorerRecommendations'

export interface ExplorerPlace extends EnrichedPlace {
  score: number
  whyRecommended: string
  priceTier: PriceTier
}

const DISTANCE_WEIGHT = 2.4
const MAX_DISTANCE_KM = 12

function distanceScore(km: number | undefined): number {
  if (km == null || !Number.isFinite(km)) return 0
  if (km > MAX_DISTANCE_KM) return 0
  return DISTANCE_WEIGHT * (1 - km / MAX_DISTANCE_KM)
}

export function rankExplorerPlaces(
  places: PlaceCardData[],
  origin: Coords,
  prefs: DiscoverPreferences | null,
  activityProfile: ActivityCategoryProfile | null,
  chipCategory: Category | null,
  searchQuery: string,
): ExplorerPlace[] {
  const enriched = enrichAllPlaces(places, origin)
  const q = searchQuery.trim().toLowerCase()

  const filtered = enriched.filter(p => {
    if (chipCategory && normalizeCategory(p.category) !== chipCategory) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q)
      || (p.address?.toLowerCase().includes(q) ?? false)
      || normalizeCategory(p.category).toLowerCase().includes(q)
    )
  })

  const ranked = filtered.map(place => {
    const base = computePlaceDiscoverScore(place, 0, 'default')
    const personal = computePlacePersonalizationBoost(
      place,
      prefs,
      origin,
      activityProfile,
    )
    const dist = distanceScore(place._dist)
    const score = base + personal + dist

    return {
      ...place,
      score,
      priceTier: estimatePriceTier(place.rating_avg),
      whyRecommended: buildExplorerRecommendation(place, prefs, activityProfile, origin),
    }
  })

  return ranked.sort((a, b) => b.score - a.score)
}

export function filterPlacesInBounds(
  places: ExplorerPlace[],
  bounds: { ne: Coords; sw: Coords },
): ExplorerPlace[] {
  return places.filter(p => {
    if (p.latitude == null || p.longitude == null) return false
    return (
      p.latitude <= bounds.ne.lat
      && p.latitude >= bounds.sw.lat
      && p.longitude <= bounds.ne.lng
      && p.longitude >= bounds.sw.lng
    )
  })
}

export function haversineFromOrigin(origin: Coords, lat: number, lng: number): number {
  return haversineKm(origin.lat, origin.lng, lat, lng)
}

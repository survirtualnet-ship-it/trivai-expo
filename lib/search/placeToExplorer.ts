import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { enrichAllPlaces } from '@/lib/discoverFilters'
import type { DiscoverPreferences } from '@/lib/discoverPreferences'
import type { ActivityCategoryProfile } from '@/lib/userActivity'
import type { Coords } from '@/lib/geolocation'
import { estimatePriceLevel } from '@/lib/explorerCategories'
import { buildExplorerRecommendation } from '@/lib/explorerRecommendations'
import type { ExplorerPlace } from '@/lib/explorerRanking'

export function toExplorerPlace(
  place: PlaceCardData,
  origin: Coords,
  prefs: DiscoverPreferences | null = null,
  activityProfile: ActivityCategoryProfile | null = null,
): ExplorerPlace {
  const enriched = enrichAllPlaces([place], origin)[0]
  return {
    ...enriched,
    score: place.rating_avg ?? 0,
    whyRecommended: buildExplorerRecommendation(place, prefs, activityProfile, origin),
    priceLevel: estimatePriceLevel(place.rating_avg),
  }
}

export function toExplorerPlaces(
  places: PlaceCardData[],
  origin: Coords,
  prefs: DiscoverPreferences | null = null,
  activityProfile: ActivityCategoryProfile | null = null,
): ExplorerPlace[] {
  const enriched = enrichAllPlaces(places, origin)
  return enriched.map((place, i) => ({
    ...place,
    score: places[i]?.rating_avg ?? 0,
    whyRecommended: buildExplorerRecommendation(places[i], prefs, activityProfile, origin),
    priceLevel: estimatePriceLevel(places[i]?.rating_avg),
  }))
}

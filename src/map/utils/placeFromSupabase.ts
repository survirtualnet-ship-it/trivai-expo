import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { firstPhoto } from '@/lib/discoverCardUtils'
import { normalizeCategory } from '@/lib/categories'
import type { MapPlace, MapPlaceType } from '../store/useMapStore'
import { normalizeMapPlace } from './placeHelpers'

function mapCategoryToType(category: string): MapPlaceType {
  const cat = normalizeCategory(category)
  if (cat === 'Entretenimiento') return 'event'
  if (cat === 'Gastronomía') return 'restaurant'
  if (cat === 'Parques') return 'park'
  return 'museum'
}

export function placeCardToMapPlace(
  place: PlaceCardData,
  opts?: { score?: number; recommended?: boolean },
): MapPlace | null {
  if (place.latitude == null || place.longitude == null) return null

  const rating = place.rating_avg ?? 0
  const score = opts?.score ?? 0
  const isTrending = !!place.is_featured || !!place.is_sponsored || rating >= 4.5
  const isRecommended =
    opts?.recommended ?? (!!place.is_featured || score >= 8)

  return normalizeMapPlace({
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    category: normalizeCategory(place.category),
    type: mapCategoryToType(place.category),
    rating,
    isTrending,
    isRecommended,
    description: place.description?.trim() || place.address?.trim() || '',
    image: firstPhoto(place.photos) ?? '',
  })
}

export function placeCardsToMapPlaces(
  places: PlaceCardData[],
  scores?: Record<string, number>,
): MapPlace[] {
  return places
    .map(p => placeCardToMapPlace(p, { score: scores?.[p.id] }))
    .filter((p): p is MapPlace => p != null)
}

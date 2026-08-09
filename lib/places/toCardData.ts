import type { Place } from '@/types/place'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

/** Map product Place (Google hybrid) → list/card UI shape. */
export function placeToCardData(place: Place): PlaceCardData {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    address: place.address ?? null,
    rating_avg: place.rating,
    rating_count: 0,
    is_open: true,
    hours: null,
    latitude: place.latitude,
    longitude: place.longitude,
    _dist: place.distance_km,
    photos: place.image_url ? [place.image_url] : [],
    is_featured: false,
    is_sponsored: false,
    description: place.description || null,
  }
}

export function placesToCardData(places: Place[]): PlaceCardData[] {
  return places.map(placeToCardData)
}

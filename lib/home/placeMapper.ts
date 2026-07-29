import type { Place } from '@/types/place'
import type { PlaceItem, ZoneId } from '@/src/data/mock'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&q=80'

export function inferZone(
  placeLat: number,
  placeLng: number,
  userLat: number,
  userLng: number,
): ZoneId {
  const dLat = placeLat - userLat
  const dLng = placeLng - userLng
  if (Math.abs(dLat) >= Math.abs(dLng)) {
    return dLat >= 0 ? 'norte' : 'sur'
  }
  return dLng >= 0 ? 'este' : 'oeste'
}

export function placeToItem(
  place: Place,
  userLat: number,
  userLng: number,
): PlaceItem {
  return {
    id: place.id,
    name: place.name,
    distance: place.distance_label ?? '—',
    category: place.category,
    imageUrl: place.image_url || FALLBACK_IMG,
    zone: inferZone(place.latitude, place.longitude, userLat, userLng),
  }
}

export function sortByDistance(items: PlaceItem[], places: Place[]): PlaceItem[] {
  const order = new Map(places.map((p, i) => [p.id, i]))
  return [...items].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
}

export function sortByRating(places: Place[], userLat: number, userLng: number): PlaceItem[] {
  return [...places]
    .sort((a, b) => b.rating - a.rating)
    .map(p => placeToItem(p, userLat, userLng))
}

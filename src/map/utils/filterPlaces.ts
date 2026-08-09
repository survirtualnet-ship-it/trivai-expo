import { haversineKm } from './geo'
import type { MapFilterId, MapPlace, MapCoords } from '../store/useMapStore'
import { placeLatitude, placeLongitude } from './placeHelpers'

const NEARBY_KM = 8

function matchesFilter(place: MapPlace, filter: MapFilterId): boolean {
  switch (filter) {
    case 'tendencias':
      return place.isTrending
    case 'para_ti':
      return place.isRecommended
    case 'eventos':
      return place.type === 'event'
    default:
      return true
  }
}

function matchesSearch(place: MapPlace, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    place.name.toLowerCase().includes(q)
    || place.category.toLowerCase().includes(q)
    || place.type.toLowerCase().includes(q)
  )
}

function originCoords(
  userLocation: MapCoords | null,
  places: MapPlace[] = [],
): MapCoords | null {
  if (userLocation) return userLocation
  const first = places[0]
  if (first) return { lat: placeLatitude(first), lng: placeLongitude(first) }
  return null
}

function sortByDistance(places: MapPlace[], origin: MapCoords): MapPlace[] {
  return [...places].sort(
    (a, b) =>
      haversineKm(origin.lat, origin.lng, placeLatitude(a), placeLongitude(a))
      - haversineKm(origin.lat, origin.lng, placeLatitude(b), placeLongitude(b)),
  )
}

export function filterMapPlaces(
  places: MapPlace[],
  filter: MapFilterId,
  searchQuery: string,
  userLocation: MapCoords | null,
): MapPlace[] {
  const origin = originCoords(userLocation, places)

  const base = places.filter(place => {
    if (!matchesSearch(place, searchQuery)) return false
    if (!matchesFilter(place, filter)) return false
    return true
  })

  if (!origin) return base

  if (filter === 'cerca') {
    const nearby = base.filter(
      place =>
        haversineKm(origin.lat, origin.lng, placeLatitude(place), placeLongitude(place))
        <= NEARBY_KM,
    )
    const pool = nearby.length > 0 ? nearby : base
    return sortByDistance(pool, origin)
  }

  return sortByDistance(base, origin)
}

export { originCoords }

import { useMemo } from 'react'
import { haversineKm } from '../utils/geo'
import { MAP_CITY_CENTER } from '../data/mockPlaces'
import {
  useMapStore,
  type MapFilterId,
  type MapPlace,
  type MapCoords,
} from '../store/useMapStore'

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

function originCoords(userLocation: MapCoords | null): MapCoords {
  return userLocation ?? MAP_CITY_CENTER
}

export function filterMapPlaces(
  places: MapPlace[],
  filter: MapFilterId,
  searchQuery: string,
  userLocation: MapCoords | null,
): MapPlace[] {
  const origin = originCoords(userLocation)

  return places.filter(place => {
    if (!matchesSearch(place, searchQuery)) return false
    if (!matchesFilter(place, filter)) return false
    if (filter === 'cerca') {
      return haversineKm(origin.lat, origin.lng, place.lat, place.lng) <= NEARBY_KM
    }
    return true
  })
}

export function useVisiblePlaces(): MapPlace[] {
  const places = useMapStore(s => s.places)
  const filter = useMapStore(s => s.activeFilter)
  const searchQuery = useMapStore(s => s.searchQuery)
  const userLocation = useMapStore(s => s.userLocation)

  return useMemo(
    () => filterMapPlaces(places, filter, searchQuery, userLocation),
    [places, filter, searchQuery, userLocation],
  )
}

export function useSearchSuggestions(): string[] {
  const places = useMapStore(s => s.places)
  const searchQuery = useMapStore(s => s.searchQuery)

  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return []
    const fromPlaces = places
      .filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .map(p => p.name)
    return [...new Set(fromPlaces)].slice(0, 5)
  }, [places, searchQuery])
}

export function useSelectedPlace(): MapPlace | undefined {
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const places = useMapStore(s => s.places)
  return useMemo(
    () => places.find(p => p.id === selectedPlaceId),
    [places, selectedPlaceId],
  )
}

export function usePlaceDistance(place: MapPlace | undefined): string {
  const userLocation = useMapStore(s => s.userLocation)
  return useMemo(() => {
    if (!place) return '—'
    const origin = originCoords(userLocation)
    const km = haversineKm(origin.lat, origin.lng, place.lat, place.lng)
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }, [place, userLocation])
}

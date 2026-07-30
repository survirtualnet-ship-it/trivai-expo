import { useMemo } from 'react'
import { haversineKm } from '../utils/geo'
import { originCoords } from '../utils/filterPlaces'
import {
  useMapStore,
  type MapPlace,
} from '../store/useMapStore'
import { placeLatitude, placeLongitude } from '../utils/placeHelpers'

export { filterMapPlaces } from '../utils/filterPlaces'

export function useVisiblePlaces(): MapPlace[] {
  return useMapStore(s => s.displayPlaces)
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
  const displayPlaces = useMapStore(s => s.displayPlaces)
  return useMemo(
    () => displayPlaces.find(p => p.id === selectedPlaceId),
    [displayPlaces, selectedPlaceId],
  )
}

export function usePlaceDistance(place: MapPlace | undefined): string {
  const userLocation = useMapStore(s => s.userLocation)
  return useMemo(() => {
    if (!place) return '—'
    const origin = originCoords(userLocation)
    const km = haversineKm(
      origin.lat,
      origin.lng,
      placeLatitude(place),
      placeLongitude(place),
    )
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }, [place, userLocation])
}

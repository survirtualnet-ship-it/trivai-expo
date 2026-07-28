import { useQuery } from '@tanstack/react-query'
import {
  fetchPlacesList,
  fetchPlaceById,
  fetchPlacesMapMarkers,
  type PlacesListFilters,
} from '@/lib/queries/places'
import { placeKeys, STALE } from '@/lib/queries/keys'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

export interface UsePlacesOptions extends PlacesListFilters {
  enabled?: boolean
}

export function usePlaces(options: UsePlacesOptions = {}) {
  const { enabled = true, category, limit, search, withCoords } = options
  const filters = { category, limit, search, withCoords }

  return useQuery({
    queryKey: placeKeys.list({ category, limit, search }),
    queryFn: () => fetchPlacesList({ category, limit, search, withCoords }),
    enabled,
    staleTime: STALE.places,
    select: (data): PlaceCardData[] => data,
  })
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: placeKeys.detail(id ?? ''),
    queryFn: () => fetchPlaceById(id!),
    enabled: !!id,
    staleTime: STALE.places,
  })
}

export function usePlacesMapMarkers() {
  return useQuery({
    queryKey: placeKeys.map(),
    queryFn: fetchPlacesMapMarkers,
    staleTime: STALE.places,
  })
}

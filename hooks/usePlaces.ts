import { useQuery } from '@tanstack/react-query'
import { fetchNearbyPlaces, fetchPlaceById } from '@/services/places.service'
import {
  fetchPlacesList,
  fetchPlaceById as fetchDbPlaceById,
  fetchPlacesMapMarkers,
  type PlacesListFilters,
} from '@/lib/queries/places'
import { placeKeys, STALE } from '@/lib/queries/keys'
import { PLACES_STALE_MS, QUERY_KEYS } from '@/lib/constants'
import type { Place, PlaceFilters } from '@/types/place'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { useLocation } from '@/hooks/useLocation'

export interface UsePlacesOptions extends PlacesListFilters {
  enabled?: boolean
  /** Use product nearby pipeline (distance-sorted). Default false for legacy callers. */
  nearby?: boolean
  radiusKm?: number
  latitude?: number
  longitude?: number
}

/**
 * Places data layer.
 * - Legacy: category/limit/search → PlaceCardData[] (lugares tab)
 * - Product: nearby:true → Place[] sorted by distance (Explore / Home)
 */
export function usePlaces(options: UsePlacesOptions = {}) {
  const {
    enabled = true,
    nearby = false,
    category,
    limit,
    search,
    withCoords,
    radiusKm,
    latitude,
    longitude,
  } = options

  const location = useLocation({ watch: nearby, enabled: nearby })
  const lat = latitude ?? (nearby ? location.latitude : undefined)
  const lng = longitude ?? (nearby ? location.longitude : undefined)

  const nearbyFilters: PlaceFilters = {
    category,
    search,
    latitude: lat,
    longitude: lng,
    radiusKm,
    limit,
  }

  const nearbyQuery = useQuery({
    queryKey: [...QUERY_KEYS.places, 'nearby', nearbyFilters],
    queryFn: () => fetchNearbyPlaces(nearbyFilters),
    enabled: enabled && nearby,
    staleTime: PLACES_STALE_MS,
  })

  const legacyQuery = useQuery({
    queryKey: placeKeys.list({ category, limit, search }),
    queryFn: () => fetchPlacesList({ category, limit, search, withCoords }),
    enabled: enabled && !nearby,
    staleTime: STALE.places,
    select: (data): PlaceCardData[] => data,
  })

  if (nearby) {
    return {
      ...nearbyQuery,
      places: (nearbyQuery.data ?? []) as Place[],
      location,
    }
  }

  return {
    ...legacyQuery,
    places: (legacyQuery.data ?? []) as PlaceCardData[],
    location,
  }
}

export function usePlace(id: string | undefined) {
  return useQuery({
    queryKey: placeKeys.detail(id ?? ''),
    queryFn: () => fetchDbPlaceById(id!),
    enabled: !!id,
    staleTime: STALE.places,
  })
}

export function useProductPlace(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.places, 'product', id],
    queryFn: () => fetchPlaceById(id!),
    enabled: !!id,
    staleTime: PLACES_STALE_MS,
  })
}

export function usePlacesMapMarkers() {
  return useQuery({
    queryKey: placeKeys.map(),
    queryFn: fetchPlacesMapMarkers,
    staleTime: STALE.places,
  })
}

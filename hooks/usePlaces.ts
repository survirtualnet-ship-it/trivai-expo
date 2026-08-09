import { useQuery } from '@tanstack/react-query'
import {
  fetchNearbyPlaces,
  fetchPlaceById,
  searchPlacesLive,
} from '@/services/places.service'
import {
  fetchPlaceById as fetchDbPlaceById,
  fetchPlacesMapMarkers,
  type PlacesListFilters,
} from '@/lib/queries/places'
import { placeKeys, STALE } from '@/lib/queries/keys'
import { PLACES_STALE_MS, QUERY_KEYS } from '@/lib/constants'
import { placesToCardData } from '@/lib/places/toCardData'
import type { Place, PlaceFilters } from '@/types/place'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { useLocation } from '@/hooks/useLocation'

export interface UsePlacesOptions extends PlacesListFilters {
  enabled?: boolean
  /** Use product Place[] pipeline. Default false → PlaceCardData[] for list UIs. */
  nearby?: boolean
  radiusKm?: number
  latitude?: number
  longitude?: number
}

/**
 * Places data layer — Google nearby/search + Trivai merge.
 * Does not use a global owned places catalog.
 */
export function usePlaces(options: UsePlacesOptions = {}) {
  const {
    enabled = true,
    nearby = false,
    category,
    limit,
    search,
    radiusKm,
    latitude,
    longitude,
  } = options

  const needsGps = !search?.trim()
  const location = useLocation({
    watch: nearby,
    enabled: enabled && needsGps,
  })

  const lat = latitude ?? location.coords?.lat
  const lng = longitude ?? location.coords?.lng
  const q = search?.trim() || undefined

  const nearbyFilters: PlaceFilters = {
    category,
    search: q,
    latitude: lat,
    longitude: lng,
    radiusKm,
    limit,
  }

  const productQuery = useQuery({
    queryKey: [...QUERY_KEYS.places, 'nearby', nearbyFilters],
    queryFn: () => fetchNearbyPlaces(nearbyFilters),
    enabled: enabled && nearby && lat != null && lng != null,
    staleTime: PLACES_STALE_MS,
  })

  const cardQuery = useQuery({
    queryKey: placeKeys.list({ category, limit, search: q, lat, lng }),
    queryFn: async (): Promise<PlaceCardData[]> => {
      if (q) {
        const places = await searchPlacesLive(q)
        return placesToCardData(places).slice(0, limit ?? 40)
      }
      if (lat == null || lng == null) return []
      const places = await fetchNearbyPlaces({
        category,
        latitude: lat,
        longitude: lng,
        radiusKm,
        limit,
      })
      return placesToCardData(places)
    },
    enabled: enabled && !nearby && (!!q || (lat != null && lng != null)),
    staleTime: STALE.places,
  })

  if (nearby) {
    return {
      ...productQuery,
      places: (productQuery.data ?? []) as Place[],
      location,
    }
  }

  return {
    ...cardQuery,
    places: (cardQuery.data ?? []) as PlaceCardData[],
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

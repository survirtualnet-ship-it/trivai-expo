import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { discoverKeys, explorerKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
import { loadDiscoverPreferences } from '@/lib/discoverPreferences'
import { fetchActivityCategoryProfile } from '@/lib/userActivity'
import {
  rankExplorerPlaces,
  type ExplorerPlace,
} from '@/lib/explorerRanking'
import type { ExplorerChipId } from '@/lib/explorerCategories'
import { explorerChipCategory } from '@/lib/explorerCategories'
import type { ExplorerLocationId } from '@/lib/explorerCategories'
import { fetchNearbyPlaces, searchPlacesLive } from '@/services/places.service'
import { placesToCardData } from '@/lib/places/toCardData'
import { PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM } from '@/lib/constants'

const CHIP_KEYWORDS: Partial<Record<ExplorerChipId, string>> = {
  restaurants: 'restaurant',
  cafes: 'cafe coffee',
  nightlife: 'bar nightlife',
  culture: 'museum culture',
  shopping: 'shopping mall',
}

async function loadExplorerPlaces(
  origin: Coords,
  chipId: ExplorerChipId,
  search: string,
) {
  const q = search.trim()
  if (q.length >= 2) {
    const places = await searchPlacesLive(q, {
      latitude: origin.lat,
      longitude: origin.lng,
    })
    return placesToCardData(places)
  }

  const keyword = CHIP_KEYWORDS[chipId]
  const places = await fetchNearbyPlaces({
    latitude: origin.lat,
    longitude: origin.lng,
    radiusKm: PLACES_DEFAULT_RADIUS_KM,
    limit: PLACES_DEFAULT_LIMIT,
    search: keyword,
  })
  return placesToCardData(places)
}

export interface UseExplorerPlacesOptions {
  chipId: ExplorerChipId
  search: string
  locationId: ExplorerLocationId
  userCoords: Coords | null
}

export function useExplorerPlaces({
  chipId,
  search,
  locationId: _locationId,
  userCoords,
}: UseExplorerPlacesOptions) {
  const { user } = useUser()
  const userId = user?.id ?? null
  const chipCategory = explorerChipCategory(chipId)

  const prefsQuery = useQuery({
    queryKey: ['explorer', 'prefs', userId ?? 'anon'],
    queryFn: () => (userId ? loadDiscoverPreferences(userId) : null),
    staleTime: STALE.user,
    enabled: !!userId,
  })

  const activityQuery = useQuery({
    queryKey: ['explorer', 'activity', userId ?? 'anon'],
    queryFn: () => (userId ? fetchActivityCategoryProfile(userId) : null),
    staleTime: STALE.user,
    enabled: !!userId,
  })

  const origin = userCoords

  const placesQuery = useQuery({
    queryKey: explorerKeys.list({
      category: chipCategory,
      search,
      userId,
      lat: origin?.lat,
      lng: origin?.lng,
    }),
    queryFn: () => loadExplorerPlaces(origin!, chipId, search),
    enabled: origin != null,
    staleTime: STALE.places,
  })

  const rankedPlaces = useMemo((): ExplorerPlace[] => {
    const flat = placesQuery.data ?? []
    if (!origin) return []
    return rankExplorerPlaces(
      flat,
      origin,
      prefsQuery.data ?? null,
      activityQuery.data ?? null,
      chipCategory,
      search,
    )
  }, [
    placesQuery.data,
    origin,
    prefsQuery.data,
    activityQuery.data,
    chipCategory,
    search,
  ])

  return {
    places: rankedPlaces,
    origin: origin ?? (userCoords ?? { lat: 0, lng: 0 }),
    loading: placesQuery.isLoading || origin == null,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: async () => undefined,
    refetch: placesQuery.refetch,
    isError: placesQuery.isError,
  }
}

export function useExplorerCoords() {
  return useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })
}

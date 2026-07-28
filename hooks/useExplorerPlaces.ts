import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { fetchPlacesList } from '@/lib/queries/places'
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
import { EXPLORER_LOCATIONS } from '@/lib/explorerCategories'

const PAGE_SIZE = 40

export interface UseExplorerPlacesOptions {
  chipId: ExplorerChipId
  search: string
  locationId: ExplorerLocationId
  userCoords: Coords | null
}

export function useExplorerPlaces({
  chipId,
  search,
  locationId,
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

  const placesQuery = useInfiniteQuery({
    queryKey: explorerKeys.list({ category: chipCategory, search, userId }),
    queryFn: ({ pageParam }) =>
      fetchPlacesList({
        category: chipCategory ?? undefined,
        withCoords: true,
        from: pageParam,
        to: pageParam + PAGE_SIZE - 1,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage.length >= PAGE_SIZE ? lastParam + PAGE_SIZE : undefined,
    staleTime: STALE.places,
  })

  const origin = useMemo((): Coords => {
    if (locationId === 'near_me' && userCoords) return userCoords
    return EXPLORER_LOCATIONS.find(l => l.id === locationId)?.center
      ?? EXPLORER_LOCATIONS[0].center
  }, [locationId, userCoords])

  const rankedPlaces = useMemo((): ExplorerPlace[] => {
    const flat = placesQuery.data?.pages.flat() ?? []
    return rankExplorerPlaces(
      flat,
      origin,
      prefsQuery.data ?? null,
      activityQuery.data ?? null,
      chipCategory,
      search,
    )
  }, [
    placesQuery.data?.pages,
    origin,
    prefsQuery.data,
    activityQuery.data,
    chipCategory,
    search,
  ])

  return {
    places: rankedPlaces,
    origin,
    loading: placesQuery.isLoading,
    isFetchingNextPage: placesQuery.isFetchingNextPage,
    hasNextPage: placesQuery.hasNextPage,
    fetchNextPage: placesQuery.fetchNextPage,
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

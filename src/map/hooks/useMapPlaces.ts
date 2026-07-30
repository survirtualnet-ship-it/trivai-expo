import { useEffect, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { fetchPlacesList } from '@/lib/queries/places'
import { discoverKeys, explorerKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
import { loadDiscoverPreferences } from '@/lib/discoverPreferences'
import { fetchActivityCategoryProfile } from '@/lib/userActivity'
import { rankExplorerPlaces } from '@/lib/explorerRanking'
import { useMapStore } from '../store/useMapStore'
import { placeCardsToMapPlaces } from '../utils/placeFromSupabase'
import { MAP_CITY_CENTER } from '../data/mockPlaces'

const PAGE_SIZE = 60

export function useMapPlaces() {
  const setPlaces = useMapStore(s => s.setPlaces)
  const searchQuery = useMapStore(s => s.searchQuery)
  const { user } = useUser()
  const userId = user?.id ?? null

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

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
    queryKey: explorerKeys.list({ search: searchQuery, userId }),
    queryFn: ({ pageParam }) =>
      fetchPlacesList({
        withCoords: true,
        from: pageParam,
        to: pageParam + PAGE_SIZE - 1,
        search: searchQuery.trim() || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastParam) =>
      lastPage.length >= PAGE_SIZE ? lastParam + PAGE_SIZE : undefined,
    staleTime: STALE.places,
  })

  const origin: Coords = coordsQuery.data ?? MAP_CITY_CENTER

  const ranked = useMemo(() => {
    const flat = placesQuery.data?.pages.flat() ?? []
    return rankExplorerPlaces(
      flat,
      origin,
      prefsQuery.data ?? null,
      activityQuery.data ?? null,
      null,
      searchQuery,
    )
  }, [
    placesQuery.data?.pages,
    origin,
    prefsQuery.data,
    activityQuery.data,
    searchQuery,
  ])

  const scores = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of ranked) map[p.id] = p.score
    return map
  }, [ranked])

  const mapPlaces = useMemo(
    () => placeCardsToMapPlaces(ranked, scores),
    [ranked, scores],
  )

  useEffect(() => {
    if (placesQuery.isLoading) return
    setPlaces(mapPlaces)
  }, [mapPlaces, placesQuery.isLoading, setPlaces])

  return {
    loading: placesQuery.isLoading,
    isError: placesQuery.isError,
    refetch: placesQuery.refetch,
    hasNextPage: placesQuery.hasNextPage,
    fetchNextPage: placesQuery.fetchNextPage,
    userCoords: coordsQuery.data ?? null,
  }
}

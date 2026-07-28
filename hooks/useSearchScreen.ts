import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { fetchPlacesList } from '@/lib/queries/places'
import { discoverKeys, searchKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
import { EXPLORER_LOCATIONS } from '@/lib/explorerCategories'
import {
  filterPlacesByQuery,
  fetchSmartSearchResults,
  mergeSearchPlaces,
} from '@/lib/smartSearch'
import {
  filterSearchCategories,
  loadRecentSearches,
  addRecentSearch,
  POPULAR_SEARCHES,
  toExplorerPlaces,
  type SearchCategory,
} from '@/lib/search'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { ExplorerPlace } from '@/lib/explorerRanking'
import { getAllMockPlaceCards, USE_MOCK_API } from '@/services/mockApi'

const DEBOUNCE_MS = 280

async function fetchSearchPlaces(query: string): Promise<PlaceCardData[]> {
  const q = query.trim()
  if (!q) return []

  const [cached, remote] = await Promise.all([
    fetchPlacesList({ limit: 120 }),
    fetchSmartSearchResults(q),
  ])

  const mockPool = USE_MOCK_API ? getAllMockPlaceCards() : []
  const merged = mergeSearchPlaces(
    mergeSearchPlaces(cached, mockPool, q),
    remote.lugares,
    q,
  )

  return filterPlacesByQuery(merged, q)
    .sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
    .slice(0, 20)
}

export function useSearchScreen() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

  const origin: Coords = coordsQuery.data ?? EXPLORER_LOCATIONS[0].center

  const recentQuery = useQuery({
    queryKey: searchKeys.recent(),
    queryFn: loadRecentSearches,
    staleTime: STALE.user,
  })

  const resultsQuery = useQuery({
    queryKey: searchKeys.results(debounced),
    queryFn: () => fetchSearchPlaces(debounced),
    enabled: debounced.length > 0,
    staleTime: STALE.places,
  })

  const categories = useMemo(
    (): SearchCategory[] => filterSearchCategories(debounced),
    [debounced],
  )

  const places = useMemo((): ExplorerPlace[] => {
    if (!debounced || !resultsQuery.data) return []
    return toExplorerPlaces(resultsQuery.data, origin)
  }, [debounced, resultsQuery.data, origin])

  const isSearching = debounced.length > 0
  const isLoading = isSearching && resultsQuery.isFetching

  const recordSearch = useCallback(async (term: string) => {
    const next = await addRecentSearch(term)
    queryClient.setQueryData(searchKeys.recent(), next)
  }, [queryClient])

  const selectSuggestion = useCallback((term: string) => {
    setQuery(term)
  }, [])

  return {
    query,
    setQuery,
    debounced,
    isSearching,
    isLoading,
    isError: isSearching && resultsQuery.isError,
    refetch: resultsQuery.refetch,
    places,
    categories,
    popularSearches: POPULAR_SEARCHES,
    recentSearches: recentQuery.data ?? [],
    recordSearch,
    selectSuggestion,
    origin,
    userId: user?.id ?? null,
  }
}

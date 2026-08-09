import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { discoverKeys, searchKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
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
import { searchPlacesLive } from '@/services/places.service'

const DEBOUNCE_MS = 160

async function fetchSearchPlaces(query: string): Promise<PlaceCardData[]> {
  const q = query.trim()
  if (!q) return []

  // Live Google search — no local DB dependency
  const live = await searchPlacesLive(q)
  return live.slice(0, 24).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    address: p.address ?? null,
    rating_avg: p.rating,
    rating_count: 0,
    is_open: true,
    hours: null,
    latitude: p.latitude,
    longitude: p.longitude,
    photos: p.image_url ? [p.image_url] : [],
    is_featured: false,
    is_sponsored: false,
  }))
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

  const liveQuery = query.trim()

  const origin = useMemo((): Coords | null => {
    if (coordsQuery.data) return coordsQuery.data
    const first = resultsQuery.data?.find(p => p.latitude != null && p.longitude != null)
    if (first?.latitude != null && first?.longitude != null) {
      return { lat: first.latitude, lng: first.longitude }
    }
    return null
  }, [coordsQuery.data, resultsQuery.data])

  const categories = useMemo(
    (): SearchCategory[] => filterSearchCategories(liveQuery || debounced),
    [liveQuery, debounced],
  )

  const places = useMemo((): ExplorerPlace[] => {
    if (!debounced || !resultsQuery.data || !origin) return []
    return toExplorerPlaces(resultsQuery.data, origin)
  }, [debounced, resultsQuery.data, origin])

  const isSearching = liveQuery.length > 0
  const isLoading = isSearching && resultsQuery.isFetching && !(resultsQuery.data?.length)

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

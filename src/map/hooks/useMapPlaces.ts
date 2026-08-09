import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { discoverKeys, explorerKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
import { loadDiscoverPreferences } from '@/lib/discoverPreferences'
import { fetchActivityCategoryProfile } from '@/lib/userActivity'
import { rankExplorerPlaces } from '@/lib/explorerRanking'
import { fetchNearbyPlaces, searchPlacesLive } from '@/services/places.service'
import { placesToCardData } from '@/lib/places/toCardData'
import { PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM } from '@/lib/constants'
import { useMapStore } from '../store/useMapStore'
import { placeCardsToMapPlaces } from '../utils/placeFromSupabase'

async function loadMapPlaces(coords: Coords | null, search: string) {
  const q = search.trim()
  if (q.length >= 2) {
    const places = await searchPlacesLive(
      q,
      coords
        ? { latitude: coords.lat, longitude: coords.lng }
        : null,
    )
    return placesToCardData(places)
  }
  if (!coords) return []
  const places = await fetchNearbyPlaces({
    latitude: coords.lat,
    longitude: coords.lng,
    radiusKm: PLACES_DEFAULT_RADIUS_KM,
    limit: PLACES_DEFAULT_LIMIT,
  })
  return placesToCardData(places)
}

export function useMapPlaces() {
  const setPlaces = useMapStore(s => s.setPlaces)
  const setRegion = useMapStore(s => s.setRegion)
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

  const placesQuery = useQuery({
    queryKey: explorerKeys.list({
      search: searchQuery,
      userId,
      lat: coordsQuery.data?.lat,
      lng: coordsQuery.data?.lng,
    }),
    queryFn: () => loadMapPlaces(coordsQuery.data ?? null, searchQuery),
    enabled:
      searchQuery.trim().length >= 2
      || coordsQuery.data != null
      || coordsQuery.isFetched,
    staleTime: STALE.places,
  })

  const origin: Coords | null = coordsQuery.data ?? null

  const ranked = useMemo(() => {
    const flat = placesQuery.data ?? []
    if (!origin || flat.length === 0) {
      return flat.map(p => ({
        ...p,
        score: 0,
        whyRecommended: '',
        priceLevel: 1 as const,
      }))
    }
    return rankExplorerPlaces(
      flat,
      origin,
      prefsQuery.data ?? null,
      activityQuery.data ?? null,
      null,
      searchQuery,
    )
  }, [
    placesQuery.data,
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

  useEffect(() => {
    if (!coordsQuery.data) return
    setRegion({
      lat: coordsQuery.data.lat,
      lng: coordsQuery.data.lng,
      latDelta: 0.045,
      lngDelta: 0.045,
    })
  }, [coordsQuery.data, setRegion])

  return {
    loading: placesQuery.isLoading || coordsQuery.isLoading,
    isError: placesQuery.isError,
    refetch: placesQuery.refetch,
    hasNextPage: false,
    fetchNextPage: async () => undefined,
    userCoords: coordsQuery.data ?? null,
  }
}

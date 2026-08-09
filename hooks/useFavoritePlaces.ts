import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { fetchFavoritePlaces } from '@/lib/favorites'
import { groupFavoritePlaces, type FavoriteGroup } from '@/lib/favoritesGrouping'
import { enrichAllPlaces } from '@/lib/discoverFilters'
import { favoriteKeys, discoverKeys, STALE } from '@/lib/queries/keys'
import { getCurrentCoords } from '@/lib/geolocation'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

export function useFavoritePlaces() {
  const { user, loading: authLoading } = useUser()
  const userId = user?.id ?? null

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

  const favoritesQuery = useQuery({
    queryKey: favoriteKeys.places(userId ?? 'anon'),
    queryFn: () => fetchFavoritePlaces(userId!),
    enabled: !!userId,
    staleTime: STALE.user,
  })

  const origin = coordsQuery.data ?? null

  const places = useMemo((): PlaceCardData[] => {
    if (!favoritesQuery.data) return []
    if (!origin) return favoritesQuery.data
    return enrichAllPlaces(favoritesQuery.data, origin)
  }, [favoritesQuery.data, origin])

  const groups = useMemo((): FavoriteGroup[] => {
    return groupFavoritePlaces(places)
  }, [places])

  return {
    user,
    isAuthenticated: !!userId,
    places,
    groups,
    isLoading: authLoading || (!!userId && favoritesQuery.isLoading),
    isError: favoritesQuery.isError,
    refetch: favoritesQuery.refetch,
    total: places.length,
  }
}

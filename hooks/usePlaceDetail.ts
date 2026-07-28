import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPlaceById } from '@/lib/queries/places'
import { fetchPlaceReviews, fetchSimilarPlaces } from '@/lib/queries/placeDetail'
import { placeKeys, discoverKeys, STALE } from '@/lib/queries/keys'
import { mapPlaceToDetail, type PlaceDetail } from '@/lib/placeDetail'
import { getCurrentCoords } from '@/lib/geolocation'
import { isPlaceFavorite, togglePlaceFavorite } from '@/lib/favorites'
import { useUser } from '@/hooks/useUser'

export function usePlaceDetail(id: string | undefined) {
  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

  const placeQuery = useQuery({
    queryKey: placeKeys.detail(id ?? ''),
    queryFn: () => fetchPlaceById(id!),
    enabled: !!id,
    staleTime: STALE.places,
  })

  const detail = useMemo((): PlaceDetail | null => {
    if (!placeQuery.data) return null
    return mapPlaceToDetail(placeQuery.data, coordsQuery.data)
  }, [placeQuery.data, coordsQuery.data])

  return {
    place: detail,
    raw: placeQuery.data,
    isLoading: placeQuery.isLoading || coordsQuery.isLoading,
    isError: placeQuery.isError,
    error: placeQuery.error,
    refetch: placeQuery.refetch,
  }
}

export function usePlaceReviews(placeId: string | undefined) {
  return useQuery({
    queryKey: placeKeys.reviews(placeId ?? ''),
    queryFn: () => fetchPlaceReviews(placeId!),
    enabled: !!placeId,
    staleTime: STALE.places,
  })
}

export function useSimilarPlaces(placeId: string | undefined, category?: string) {
  return useQuery({
    queryKey: placeKeys.similar(placeId ?? ''),
    queryFn: () => fetchSimilarPlaces(placeId!, category!),
    enabled: !!placeId && !!category,
    staleTime: STALE.places,
  })
}

export function usePlaceFavorite(placeId: string | undefined) {
  const { user } = useUser()
  const userId = user?.id ?? null
  const queryClient = useQueryClient()

  const favQuery = useQuery({
    queryKey: placeKeys.favorite(userId ?? 'anon', placeId ?? ''),
    queryFn: () => (userId && placeId ? isPlaceFavorite(userId, placeId) : false),
    enabled: !!userId && !!placeId,
    staleTime: STALE.user,
  })

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      if (!userId || !placeId) throw new Error('auth')
      await togglePlaceFavorite(userId, placeId, next)
      return next
    },
    onMutate: async (next) => {
      const key = placeKeys.favorite(userId ?? 'anon', placeId ?? '')
      await queryClient.cancelQueries({ queryKey: key })
      const prev = queryClient.getQueryData<boolean>(key)
      queryClient.setQueryData(key, next)
      return { prev }
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev != null) {
        queryClient.setQueryData(
          placeKeys.favorite(userId ?? 'anon', placeId ?? ''),
          ctx.prev,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: placeKeys.favorite(userId ?? 'anon', placeId ?? ''),
      })
    },
  })

  return {
    isFavorite: favQuery.data ?? false,
    isLoading: favQuery.isLoading,
    toggle: () => mutation.mutate(!(favQuery.data ?? false)),
    isPending: mutation.isPending,
  }
}

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchFavoritePlaces,
  togglePlaceFavorite,
  isPlaceFavorite,
} from '@/lib/favorites'
import { favoriteKeys, STALE } from '@/lib/queries/keys'
import { QUERY_KEYS } from '@/lib/constants'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

/**
 * Favorites sync with Supabase `favorites` (user_id, place_id).
 * Private by default — RLS must enforce owner-only access.
 */
export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const userId = user?.id ?? null
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: favoriteKeys.places(userId ?? 'anon'),
    queryFn: () => fetchFavoritePlaces(userId!),
    enabled: !!userId,
    staleTime: STALE.user,
  })

  const places = (listQuery.data ?? []) as PlaceCardData[]
  const ids = useMemo(() => new Set(places.map(p => p.id)), [places])

  const invalidate = useCallback(async () => {
    if (!userId) return
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: favoriteKeys.places(userId) }),
      queryClient.invalidateQueries({ queryKey: favoriteKeys.count(userId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites }),
    ])
  }, [queryClient, userId])

  const toggleMutation = useMutation({
    mutationFn: async ({ placeId, active }: { placeId: string; active: boolean }) => {
      if (!userId) throw new Error('Auth required')
      await togglePlaceFavorite(userId, placeId, active)
    },
    onSuccess: invalidate,
  })

  const isFavorite = useCallback((placeId: string) => ids.has(placeId), [ids])

  const addFavorite = useCallback(async (placeId: string) => {
    if (!isAuthenticated) return false
    await toggleMutation.mutateAsync({ placeId, active: true })
    return true
  }, [isAuthenticated, toggleMutation])

  const removeFavorite = useCallback(async (placeId: string) => {
    if (!isAuthenticated) return false
    await toggleMutation.mutateAsync({ placeId, active: false })
    return true
  }, [isAuthenticated, toggleMutation])

  const toggleFavorite = useCallback(async (placeId: string) => {
    if (!isAuthenticated) return false
    const next = !ids.has(placeId)
    await toggleMutation.mutateAsync({ placeId, active: next })
    return next
  }, [isAuthenticated, ids, toggleMutation])

  const checkFavorite = useCallback(async (placeId: string) => {
    if (!userId) return false
    return isPlaceFavorite(userId, placeId)
  }, [userId])

  return {
    places,
    ids,
    total: places.length,
    isAuthenticated,
    isLoading: !!userId && listQuery.isLoading,
    isError: listQuery.isError,
    isPending: toggleMutation.isPending,
    refetch: listQuery.refetch,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    checkFavorite,
  }
}

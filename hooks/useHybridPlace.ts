import { useQuery } from '@tanstack/react-query'
import { fetchHybridPlaceMeta } from '@/lib/places'
import { placeKeys, STALE } from '@/lib/queries/keys'
import { useUser } from '@/hooks/useUser'

export function useHybridPlace(placeId: string | undefined) {
  const { user, profile } = useUser()

  return useQuery({
    queryKey: placeKeys.hybrid(placeId ?? '', user?.id ?? 'anon'),
    queryFn: () =>
      fetchHybridPlaceMeta(placeId!, user?.id, profile ?? null),
    enabled: !!placeId,
    staleTime: STALE.places,
  })
}

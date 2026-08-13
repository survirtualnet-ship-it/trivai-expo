import { useQuery } from '@tanstack/react-query'
import { fetchBusinessesByOwnerId } from '@/lib/places/businessService'
import { mapTrivaiBusinessRow, type Business } from '@/lib/domain/business'
import { useUser } from '@/hooks/useUser'

export const ownedBusinessKeys = {
  all: ['owned-businesses'] as const,
  byUser: (userId: string) => [...ownedBusinessKeys.all, userId] as const,
}

/** All businesses owned by the current user (multi-business support). */
export function useOwnedBusinesses() {
  const { user } = useUser()
  const userId = user?.id

  const query = useQuery({
    queryKey: ownedBusinessKeys.byUser(userId ?? ''),
    queryFn: async (): Promise<Business[]> => {
      if (!userId) return []
      const rows = await fetchBusinessesByOwnerId(userId)
      return rows.map(row =>
        mapTrivaiBusinessRow(row, row.google_place_id, row.place_id),
      )
    },
    enabled: !!userId,
    staleTime: 60_000,
  })

  return {
    businesses: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

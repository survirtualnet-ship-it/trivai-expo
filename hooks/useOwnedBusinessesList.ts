import { useQuery } from '@tanstack/react-query'
import { fetchOwnedBusinessesEnriched } from '@/lib/business/businessPlan'
import { normalizeSubscriptionTier } from '@/lib/domain/business'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { useUser } from '@/hooks/useUser'

export type OwnedBusinessListItem = {
  placeId: string
  googlePlaceId: string
  name: string
  address: string
  subscriptionTier: BusinessSubscriptionTier
}

export const ownedBusinessListKeys = {
  all: ['owned-businesses-list'] as const,
  byUser: (userId: string) => [...ownedBusinessListKeys.all, userId] as const,
}

export function useOwnedBusinessesList() {
  const { user } = useUser()
  const userId = user?.id

  const query = useQuery({
    queryKey: ownedBusinessListKeys.byUser(userId ?? ''),
    queryFn: async (): Promise<OwnedBusinessListItem[]> => {
      if (!userId) return []
      const rows = await fetchOwnedBusinessesEnriched(userId)
      return rows.map(row => ({
        placeId: row.place_id,
        googlePlaceId: row.google_place_id,
        name: row.places?.name ?? 'Negocio',
        address: row.places?.address ?? '',
        subscriptionTier: normalizeSubscriptionTier(
          row.subscription_status,
          row.subscription_plan,
          row.claimed === true && !!row.owner_id,
        ),
      }))
    },
    enabled: !!userId,
    staleTime: 30_000,
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

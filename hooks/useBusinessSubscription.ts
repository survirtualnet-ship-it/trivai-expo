import { useQuery } from '@tanstack/react-query'
import { fetchBusinessByPlaceIdEnriched } from '@/lib/business/businessPlan'
import { mapTrivaiBusinessRow } from '@/lib/domain/business'

export const businessSubscriptionKeys = {
  byPlace: (placeId: string) => ['business-subscription', placeId] as const,
}

export function useBusinessSubscription(placeId: string | null | undefined) {
  const query = useQuery({
    queryKey: businessSubscriptionKeys.byPlace(placeId ?? ''),
    queryFn: async () => {
      if (!placeId) return null
      const row = await fetchBusinessByPlaceIdEnriched(placeId)
      if (!row) return null
      return mapTrivaiBusinessRow(row, row.google_place_id, row.place_id)
    },
    enabled: !!placeId,
    staleTime: 30_000,
  })

  return {
    business: query.data,
    tier: query.data?.subscriptionTier ?? 'none',
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

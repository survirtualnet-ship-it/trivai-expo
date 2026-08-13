import { useMemo } from 'react'
import { opportunitiesFromHealth } from '@/lib/domain/business-opportunities'
import type { BusinessHealthScore } from '@/lib/domain/business-health'
import type { BusinessOpportunity } from '@/lib/domain/business-opportunities'

export type UseBusinessOpportunitiesParams = {
  placeId: string
  health: BusinessHealthScore | null
  unansweredReviews: number
  productCount: number
  galleryCount: number
  hasPromotions: boolean
  descriptionLength: number
  hoursComplete: boolean
  completedIds?: string[]
}

export function useBusinessOpportunities(
  params: UseBusinessOpportunitiesParams | null,
): BusinessOpportunity[] {
  return useMemo(() => {
    if (!params?.health) return []
    return opportunitiesFromHealth({
      placeId: params.placeId,
      health: params.health,
      unansweredReviews: params.unansweredReviews,
      productCount: params.productCount,
      galleryCount: params.galleryCount,
      hasPromotions: params.hasPromotions,
      descriptionLength: params.descriptionLength,
      hoursComplete: params.hoursComplete,
      completedIds: params.completedIds,
    })
  }, [params])
}

/**
 * Business Health Score — public domain API.
 * @see BUSINESS_HEALTH_ARCHITECTURE.md
 */

export type {
  BusinessHealthInput,
  BusinessHealthScore,
  HealthDimensionId,
  HealthDimensionScore,
  HealthLevel,
  HealthLevelLabel,
} from './types'

export { DIMENSION_WEIGHTS, TOTAL_WEIGHT } from './weights'
export { calculateHealthScore } from './scoreCalculator'

import type { Company, Product, Review } from '@/src/company/types'
import type { BusinessEnrichment } from '@/lib/business/profileTypes'
import { calculateHealthScore } from './scoreCalculator'
import type { BusinessHealthInput, BusinessHealthScore } from './types'

export type BuildHealthInputParams = {
  placeId: string
  company: Company
  enrichment: BusinessEnrichment | null
  products: Product[]
  reviews: Review[]
  galleryCount: number
  menuItemCount: number
  promotionCount: number
  recentEventCount: number
}

export function buildHealthInput(params: BuildHealthInputParams): BusinessHealthInput {
  const { company, enrichment, products, reviews } = params
  const answered =
    reviews.length === 0
      ? 0
      : Math.round(
          (reviews.filter(r => r.companyReply?.trim()).length / reviews.length) * 100,
        )

  const socials = enrichment?.social ?? {}
  const socialCount = [
    socials.instagram,
    socials.facebook,
    socials.tiktok,
    socials.youtube,
    socials.linkedin,
    socials.x,
  ].filter(Boolean).length

  const profileChecks = [
    !!company.description?.trim(),
    !!company.phone?.trim(),
    !!(enrichment?.whatsapp || company.whatsapp)?.trim(),
    !!company.website?.trim(),
    !!(enrichment?.emailCommercial || company.email)?.trim(),
    params.galleryCount > 0,
    !!company.customLogoUrl,
  ]

  return {
    placeId: params.placeId,
    hasCoverPhoto: params.galleryCount > 0 || !!company.coverImage,
    hasCustomLogo: !!company.customLogoUrl,
    descriptionLength: company.description?.trim().length ?? 0,
    productCount: products.length,
    galleryCount: params.galleryCount,
    menuItemCount: params.menuItemCount,
    hasCompleteHours: enrichment?.hoursComplete ?? false,
    hasWhatsApp: !!(enrichment?.whatsapp || company.whatsapp)?.trim(),
    hasWebsite: !!company.website?.trim(),
    hasPhone: !!company.phone?.trim(),
    hasEmail: !!(enrichment?.emailCommercial || company.email)?.trim(),
    socialCount,
    reviewCount: reviews.length,
    reviewsAnsweredPercent: answered,
    activePromotionCount: params.promotionCount,
    recentEventCount: params.recentEventCount,
    profileFieldsFilled: profileChecks.filter(Boolean).length,
    profileFieldsTotal: profileChecks.length,
  }
}

export function computeBusinessHealth(params: BuildHealthInputParams): BusinessHealthScore {
  return calculateHealthScore(buildHealthInput(params))
}

export function formatHealthScoreDisplay(result: BusinessHealthScore): string {
  return `${result.score} / ${result.maxScore}`
}

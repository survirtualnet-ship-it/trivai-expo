/** Business Health Score — domain types. */

export type HealthLevel = 'excellent' | 'good' | 'needs_improvement' | 'incomplete'

export type HealthLevelLabel = 'Excelente' | 'Bueno' | 'Puede mejorar' | 'Incompleto'

export type HealthDimensionId =
  | 'profile'
  | 'products'
  | 'hours'
  | 'gallery'
  | 'reputation'

export type HealthDimensionScore = {
  id: HealthDimensionId
  label: string
  percent: number
  weightedPoints: number
  maxWeightedPoints: number
  hints: string[]
}

export type BusinessHealthScore = {
  score: number
  maxScore: number
  level: HealthLevel
  levelLabel: HealthLevelLabel
  dimensions: HealthDimensionScore[]
  calculatedAt: string
}

/** Snapshot consumed by the calculator — decoupled from UI models. */
export type BusinessHealthInput = {
  placeId: string
  hasCoverPhoto: boolean
  hasCustomLogo: boolean
  descriptionLength: number
  productCount: number
  galleryCount: number
  menuItemCount: number
  hasCompleteHours: boolean
  hasWhatsApp: boolean
  hasWebsite: boolean
  hasPhone: boolean
  hasEmail: boolean
  socialCount: number
  reviewCount: number
  reviewsAnsweredPercent: number
  activePromotionCount: number
  recentEventCount: number
  profileFieldsFilled: number
  profileFieldsTotal: number
}

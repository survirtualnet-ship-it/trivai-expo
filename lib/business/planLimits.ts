import type { BusinessSubscriptionTier } from '@/lib/domain/business'

export type PlanLimits = {
  products: number
  gallery: number
  menuSections: number
}

const LIMITS: Record<BusinessSubscriptionTier, PlanLimits> = {
  none: { products: 0, gallery: 0, menuSections: 0 },
  free: { products: 5, gallery: 3, menuSections: 2 },
  pro: { products: 50, gallery: 20, menuSections: 10 },
  premium: { products: 500, gallery: 100, menuSections: 50 },
}

export function getPlanLimits(tier: BusinessSubscriptionTier): PlanLimits {
  return LIMITS[tier]
}

export function getProductLimit(tier: BusinessSubscriptionTier): number {
  return LIMITS[tier].products
}

export function getGalleryLimit(tier: BusinessSubscriptionTier): number {
  return LIMITS[tier].gallery
}

export function canAddProduct(tier: BusinessSubscriptionTier, currentCount: number): boolean {
  return currentCount < getProductLimit(tier)
}

export function canAddGalleryImage(tier: BusinessSubscriptionTier, currentCount: number): boolean {
  return currentCount < getGalleryLimit(tier)
}

import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { tierAtLeast } from '@/lib/domain/business'

export type BusinessFeature =
  | 'claim_business'
  | 'edit_basic_info'
  | 'reply_reviews'
  | 'hours'
  | 'contact'
  | 'dashboard_basic'
  | 'dashboard'
  | 'stats'
  | 'analytics'
  | 'products_basic'
  | 'products'
  | 'menu'
  | 'promotions'
  | 'gallery'
  | 'custom_logo'
  | 'recommendation_priority'
  | 'campaigns'
  | 'automations'
  | 'advanced_reports'
  | 'advanced_analytics'
  | 'ai_placeholder'

const MIN_TIER: Record<BusinessFeature, BusinessSubscriptionTier> = {
  claim_business: 'free',
  edit_basic_info: 'free',
  reply_reviews: 'free',
  hours: 'free',
  contact: 'free',
  dashboard_basic: 'free',
  dashboard: 'pro',
  stats: 'pro',
  analytics: 'pro',
  products_basic: 'free',
  products: 'pro',
  menu: 'pro',
  promotions: 'pro',
  gallery: 'pro',
  custom_logo: 'pro',
  recommendation_priority: 'pro',
  campaigns: 'premium',
  automations: 'premium',
  advanced_reports: 'premium',
  advanced_analytics: 'premium',
  ai_placeholder: 'premium',
}

const UPGRADE_LABEL: Record<BusinessSubscriptionTier, string> = {
  none: 'Debes elegir un plan para usar esta función.',
  free: 'Disponible en plan Pro.',
  pro: 'Disponible en plan Premium.',
  premium: '',
}

/** All gating uses subscription tier — never claimStatus. */
export function canUseBusinessFeature(
  tier: BusinessSubscriptionTier,
  feature: BusinessFeature,
): boolean {
  if (tier === 'none') return false
  return tierAtLeast(tier, MIN_TIER[feature])
}

export function upgradeMessageForFeature(
  tier: BusinessSubscriptionTier,
  feature: BusinessFeature,
): string {
  if (canUseBusinessFeature(tier, feature)) return ''
  const required = MIN_TIER[feature]
  if (tier === 'none') return UPGRADE_LABEL.none
  if (required === 'pro') return UPGRADE_LABEL.free
  if (required === 'premium') return UPGRADE_LABEL.pro
  return UPGRADE_LABEL.none
}

// ─── Named permission helpers (single source of truth) ───────────────────────

export function canAccessDashboard(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'dashboard')
}

export function canAccessBasicDashboard(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'dashboard_basic')
}

export function canChangeBusinessLogo(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'custom_logo')
}

export function canEditBasicInfo(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'edit_basic_info')
}

export function canEditProducts(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'products')
}

export function canUseAnalytics(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'analytics')
}

export function canCreatePromotions(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'promotions')
}

export function canUseAI(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'ai_placeholder')
}

export function canUseCampaigns(tier: BusinessSubscriptionTier): boolean {
  return canUseBusinessFeature(tier, 'campaigns')
}

export function tabAllowedForTier(
  tab: 'home' | 'products' | 'gallery' | 'reviews' | 'dashboard',
  tier: BusinessSubscriptionTier,
): boolean {
  switch (tab) {
    case 'home':
      return tier !== 'none'
    case 'reviews':
      return canUseBusinessFeature(tier, 'reply_reviews')
    case 'products':
      return canEditProducts(tier)
    case 'gallery':
      return canUseBusinessFeature(tier, 'gallery')
    case 'dashboard':
      return canAccessDashboard(tier) || canAccessBasicDashboard(tier)
    default:
      return false
  }
}

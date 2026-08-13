import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { tierAtLeast } from '@/lib/domain/business'

export type BusinessFeature =
  | 'claim_business'
  | 'edit_basic_info'
  | 'reply_reviews'
  | 'hours'
  | 'contact'
  | 'dashboard'
  | 'stats'
  | 'products'
  | 'menu'
  | 'promotions'
  | 'gallery'
  | 'campaigns'
  | 'advanced_analytics'
  | 'ai_placeholder'

const MIN_TIER: Record<BusinessFeature, BusinessSubscriptionTier> = {
  claim_business: 'free',
  edit_basic_info: 'free',
  reply_reviews: 'free',
  hours: 'free',
  contact: 'free',
  dashboard: 'pro',
  stats: 'pro',
  products: 'pro',
  menu: 'pro',
  promotions: 'pro',
  gallery: 'pro',
  campaigns: 'premium',
  advanced_analytics: 'premium',
  ai_placeholder: 'premium',
}

const UPGRADE_LABEL: Record<BusinessSubscriptionTier, string> = {
  none: 'Debes elegir un plan para usar esta función.',
  free: 'Disponible en plan Pro.',
  pro: 'Disponible en plan Premium.',
  premium: '',
}

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
      return canUseBusinessFeature(tier, 'products')
    case 'gallery':
      return canUseBusinessFeature(tier, 'gallery')
    case 'dashboard':
      return canUseBusinessFeature(tier, 'dashboard')
    default:
      return false
  }
}

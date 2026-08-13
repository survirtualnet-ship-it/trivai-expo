/**
 * Business domain — businesses are NOT users.
 * Google Maps is the canonical place source; Supabase stores Trivai enrichment only.
 */

import type { TrivaiBusiness } from '@/lib/places/types'

export type BusinessLifecyclePhase =
  | 'identified'
  | 'claimed'
  | 'subscription_active'
  | 'verified'

/** Claim state — unclaimed = Google only; claimed = has owner (post-verification). */
export type BusinessClaimStatus = 'unclaimed' | 'claimed'

/** @deprecated DB legacy alias */
export type LegacyClaimStatus = 'identified'

/**
 * Subscription tier — separate from Claim.
 * `none` = claimed but no plan chosen yet.
 */
export type BusinessSubscriptionTier = 'none' | 'free' | 'pro' | 'premium'

/** @deprecated Uppercase plan column — use BusinessSubscriptionTier */
export type BusinessSubscriptionPlan = 'FREE' | 'PRO' | 'PREMIUM'

/** @deprecated Legacy payment states — tier field replaces these for gating */
export type BusinessSubscriptionStatus =
  | 'none'
  | 'active'
  | 'expired'
  | 'cancelled'
  | BusinessSubscriptionTier

export type BusinessVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'

export type Business = {
  id: string
  googlePlaceId: string
  ownerUserId: string | null
  claimStatus: BusinessClaimStatus
  subscriptionTier: BusinessSubscriptionTier
  verificationStatus: BusinessVerificationStatus
  lifecyclePhase: BusinessLifecyclePhase
}

const TIER_ORDER: Record<BusinessSubscriptionTier, number> = {
  none: 0,
  free: 1,
  pro: 2,
  premium: 3,
}

export function normalizeClaimStatus(
  raw: string | undefined | null,
  claimed: boolean,
): BusinessClaimStatus {
  if (raw === 'claimed' || (claimed && raw !== 'unclaimed' && raw !== 'identified')) {
    return 'claimed'
  }
  if (raw === 'unclaimed' || raw === 'identified' || !claimed) {
    return claimed ? 'claimed' : 'unclaimed'
  }
  return claimed ? 'claimed' : 'unclaimed'
}

/** Map DB subscription_status + legacy subscription_plan → tier. */
export function normalizeSubscriptionTier(
  statusRaw: string | undefined | null,
  planRaw: string | undefined | null,
  claimed: boolean,
): BusinessSubscriptionTier {
  const s = (statusRaw ?? '').toLowerCase()
  if (s === 'free' || s === 'pro' || s === 'premium') return s
  if (s === 'none' || s === '') return claimed ? 'none' : 'none'

  // Legacy: subscription_status = active + subscription_plan
  const p = (planRaw ?? '').toUpperCase()
  if (s === 'active') {
    if (p === 'PRO') return 'pro'
    if (p === 'PREMIUM') return 'premium'
    return 'free'
  }

  if (p === 'PRO') return 'pro'
  if (p === 'PREMIUM') return 'premium'
  if (p === 'FREE') return 'free'

  return 'none'
}

export function mapTrivaiBusinessRow(
  row: TrivaiBusiness | null,
  googlePlaceId: string,
  placeUuid?: string | null,
): Business {
  const id = row?.place_id ?? placeUuid ?? googlePlaceId
  const claimed = row?.claimed === true && !!row.owner_id
  const claimStatus = normalizeClaimStatus(row?.claim_status, claimed)
  const subscriptionTier = normalizeSubscriptionTier(
    row?.subscription_status,
    row?.subscription_plan,
    claimed,
  )
  const verificationStatus =
    (row?.verification_status as BusinessVerificationStatus | undefined) ??
    'unverified'

  return {
    id,
    googlePlaceId: row?.google_place_id ?? googlePlaceId,
    ownerUserId: row?.owner_id ?? null,
    claimStatus,
    subscriptionTier,
    verificationStatus,
    lifecyclePhase: deriveLifecyclePhase({
      claimStatus,
      subscriptionTier,
      verificationStatus,
    }),
  }
}

export function deriveLifecyclePhase(input: {
  claimStatus: BusinessClaimStatus
  subscriptionTier: BusinessSubscriptionTier
  verificationStatus: BusinessVerificationStatus
}): BusinessLifecyclePhase {
  if (input.claimStatus === 'unclaimed') return 'identified'
  if (input.verificationStatus === 'verified') return 'verified'
  if (input.subscriptionTier === 'pro' || input.subscriptionTier === 'premium') {
    return 'subscription_active'
  }
  if (input.subscriptionTier === 'free') return 'claimed'
  return 'claimed'
}

export function isBusinessClaimed(b: Business): boolean {
  return b.claimStatus === 'claimed' && !!b.ownerUserId
}

export function hasChosenSubscription(b: Business): boolean {
  return b.subscriptionTier !== 'none'
}

export function tierAtLeast(
  current: BusinessSubscriptionTier,
  required: BusinessSubscriptionTier,
): boolean {
  return TIER_ORDER[current] >= TIER_ORDER[required]
}

export function canAccessBusinessDashboard(
  b: Business,
  userId: string | null,
): boolean {
  if (!userId || !isBusinessClaimed(b) || b.ownerUserId !== userId) return false
  return tierAtLeast(b.subscriptionTier, 'pro')
}

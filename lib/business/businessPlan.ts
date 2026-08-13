import { supabase } from '@/lib/supabase'
import type { TrivaiBusiness } from '@/lib/places/types'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'

export type UpdateBusinessSubscriptionInput = {
  placeId: string
  tier: Exclude<BusinessSubscriptionTier, 'none'>
}

/** Legacy uppercase for subscription_plan column compat. */
function tierToLegacyPlan(tier: Exclude<BusinessSubscriptionTier, 'none'>): string {
  return tier.toUpperCase()
}

/** Persist subscription tier after plan selection (no payment yet). */
export async function updateBusinessSubscription(
  input: UpdateBusinessSubscriptionInput,
): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('trivai_business')
    .update({
      subscription_status: input.tier,
      subscription_plan: tierToLegacyPlan(input.tier),
      subscription_started_at: now,
      subscription_expires_at: null,
      updated_at: now,
    })
    .eq('place_id', input.placeId)

  if (error) {
    throw new Error(error.message)
  }
}

/** @deprecated Use updateBusinessSubscription */
export async function updateBusinessPlan(input: {
  placeId: string
  plan: 'FREE' | 'PRO' | 'PREMIUM'
}): Promise<void> {
  const tierMap = { FREE: 'free', PRO: 'pro', PREMIUM: 'premium' } as const
  await updateBusinessSubscription({
    placeId: input.placeId,
    tier: tierMap[input.plan],
  })
}

export type OwnedBusinessRow = TrivaiBusiness & {
  places?: {
    name: string
    address: string | null
    category: string | null
    photos: string[] | null
  } | null
}

export async function fetchBusinessByPlaceIdEnriched(
  placeId: string,
): Promise<OwnedBusinessRow | null> {
  const { data, error } = await supabase
    .from('trivai_business')
    .select('*, places(name, address, category, photos, rating_count, rating_avg, is_verified)')
    .eq('place_id', placeId)
    .maybeSingle()

  if (error) {
    console.warn('[business-by-place]', error.message)
    return null
  }
  return data as OwnedBusinessRow | null
}

export async function fetchOwnedBusinessesEnriched(
  ownerId: string,
): Promise<OwnedBusinessRow[]> {
  const { data, error } = await supabase
    .from('trivai_business')
    .select('*, places(name, address, category, photos, rating_count, rating_avg, is_verified)')
    .eq('owner_id', ownerId)
    .eq('claimed', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.warn('[owned-businesses]', error.message)
    return []
  }
  return (data ?? []) as OwnedBusinessRow[]
}

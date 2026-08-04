import type { Profile } from '@/lib/supabase'
import type { TrivaiBusiness } from './types'

/**
 * Owner check — never trust query params.
 * business_place_id on profile must equal the Supabase place UUID.
 */
export function isBusinessOwner(
  userId: string | undefined | null,
  profile: Pick<Profile, 'business_place_id' | 'account_type'> | null | undefined,
  placeUuid: string,
  business: TrivaiBusiness | null,
): boolean {
  if (!userId || !placeUuid) return false
  if (profile?.account_type === 'business' && profile.business_place_id === placeUuid) {
    return true
  }
  return business?.claimed === true && business.owner_id === userId
}

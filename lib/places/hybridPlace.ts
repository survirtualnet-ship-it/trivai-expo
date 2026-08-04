import type { Profile } from '@/lib/supabase'
import {
  fetchBusinessByPlaceId,
  fetchPlaceLiveContent,
} from './businessService'
import { isBusinessOwner } from './ownership'
import type { HybridPlaceMeta } from './types'

export async function fetchHybridPlaceMeta(
  placeUuid: string,
  userId?: string | null,
  profile?: Pick<Profile, 'business_place_id' | 'account_type'> | null,
): Promise<HybridPlaceMeta> {
  const [business, live] = await Promise.all([
    fetchBusinessByPlaceId(placeUuid),
    fetchPlaceLiveContent(placeUuid),
  ])

  const claimed = business?.claimed === true
  const isOwner = isBusinessOwner(userId, profile ?? null, placeUuid, business)

  return {
    googlePlaceId: business?.google_place_id ?? null,
    claimed,
    isOwner,
    live,
  }
}

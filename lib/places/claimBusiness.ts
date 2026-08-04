import { supabase } from '@/lib/supabase'
import {
  fetchBusinessByGooglePlaceId,
  findPlaceUuidByGoogleId,
} from './businessService'
import { syncGooglePlaceToSupabase } from './googlePlacesClient'
import type { ClaimBusinessInput, ClaimBusinessResult } from './types'

export class ClaimBusinessError extends Error {
  constructor(
    message: string,
    readonly code: 'ALREADY_CLAIMED' | 'NOT_AUTHENTICATED' | 'DB_ERROR',
  ) {
    super(message)
    this.name = 'ClaimBusinessError'
  }
}

/**
 * Self-service claim — no admin approval.
 * Creates enrichment shell in `places` + registry in `trivai_business`.
 */
export async function claimBusiness(
  input: ClaimBusinessInput,
): Promise<ClaimBusinessResult> {
  if (!input.ownerId) {
    throw new ClaimBusinessError('Debes iniciar sesión', 'NOT_AUTHENTICATED')
  }

  const existingBiz = await fetchBusinessByGooglePlaceId(input.googlePlaceId)
  if (
    existingBiz?.claimed &&
    existingBiz.owner_id &&
    existingBiz.owner_id !== input.ownerId
  ) {
    throw new ClaimBusinessError(
      'Este negocio ya fue reclamado por otro usuario',
      'ALREADY_CLAIMED',
    )
  }

  let placeUuid =
    existingBiz?.place_id ?? (await findPlaceUuidByGoogleId(input.googlePlaceId))

  if (!placeUuid) {
    const { data: inserted, error } = await supabase
      .from('places')
      .insert({
        name: input.name,
        address: input.address,
        latitude: input.lat,
        longitude: input.lng,
        google_place_id: input.googlePlaceId,
        category: input.category ?? 'Otros',
        description: input.description ?? null,
        phone: input.phone ?? null,
        website: input.website ?? null,
        city: 'Santa Cruz de la Sierra',
        photos: [],
        rating_avg: 0,
        rating_count: 0,
        is_open: true,
        is_sponsored: false,
        is_featured: false,
        is_verified: false,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      throw new ClaimBusinessError(
        error?.message ?? 'No se pudo crear el perfil del negocio',
        'DB_ERROR',
      )
    }
    placeUuid = inserted.id
  } else {
    await supabase
      .from('places')
      .update({
        google_place_id: input.googlePlaceId,
        name: input.name,
        address: input.address,
        latitude: input.lat,
        longitude: input.lng,
        category: input.category ?? undefined,
        description: input.description ?? undefined,
        phone: input.phone ?? undefined,
        website: input.website ?? undefined,
      })
      .eq('id', placeUuid)
  }

  await syncGooglePlaceToSupabase(placeUuid, input.googlePlaceId)

  const { error: bizError } = await supabase.from('trivai_business').upsert(
    {
      place_id: placeUuid,
      google_place_id: input.googlePlaceId,
      claimed: true,
      owner_id: input.ownerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'google_place_id' },
  )

  if (bizError) {
    throw new ClaimBusinessError(bizError.message, 'DB_ERROR')
  }

  await supabase
    .from('profiles')
    .update({
      account_type: 'business',
      business_place_id: placeUuid,
      business_name: input.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.ownerId)

  return {
    placeId: placeUuid,
    googlePlaceId: input.googlePlaceId,
    claimed: true,
    alreadyClaimed: false,
  }
}

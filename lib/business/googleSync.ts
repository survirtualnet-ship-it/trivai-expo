import { supabase } from '@/lib/supabase'

/** Google-owned fields synced into places — never overwrite Trivai enrichment. */
export type GooglePlaceSyncPayload = {
  name?: string
  address?: string | null
  category?: string
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  googlePlaceId: string
}

/**
 * Merge Google canonical updates into places.
 * Trivai enrichment (business_enrichment, products, gallery) is untouched.
 */
export async function syncGooglePlaceFields(
  placeId: string,
  google: GooglePlaceSyncPayload,
): Promise<{ ok: boolean; error?: string }> {
  const { error: placeError } = await supabase
    .from('places')
    .update({
      name: google.name,
      address: google.address,
      category: google.category,
      phone: google.phone,
      latitude: google.latitude,
      longitude: google.longitude,
      google_place_id: google.googlePlaceId,
    })
    .eq('id', placeId)

  if (placeError) return { ok: false, error: placeError.message }

  await supabase
    .from('business_enrichment')
    .upsert(
      {
        place_id: placeId,
        google_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'place_id' },
    )

  return { ok: true }
}

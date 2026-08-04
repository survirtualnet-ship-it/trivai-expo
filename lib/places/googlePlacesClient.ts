import { ENV } from '@/lib/env'
import { supabase } from '@/lib/supabase'
import type { GooglePlaceId, PlaceUuid } from './types'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/** Sync Google base fields into places row via Next.js proxy (keeps API key server-side). */
export async function syncGooglePlaceToSupabase(
  placeUuid: PlaceUuid,
  googlePlaceId: GooglePlaceId,
): Promise<void> {
  try {
    const res = await fetch(`${ENV.webApiUrl}/api/google-places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        place_uuid: placeUuid,
        google_place_id: googlePlaceId,
        sync_data: true,
      }),
    })
    if (!res.ok) {
      console.warn('[places] Google sync failed', await res.text())
    }
  } catch (err) {
    console.warn('[places] Google sync error', err)
  }
}

/** Upsert lightweight cache row — not a global business DB. */
export async function upsertPlacesCache(payload: {
  google_place_id: GooglePlaceId
  name: string
  address?: string
  latitude?: number
  longitude?: number
  rating_avg?: number
  rating_count?: number
  photos?: string[]
}): Promise<void> {
  const { error } = await supabase.from('places_cache').upsert(
    {
      ...payload,
      last_fetched: new Date().toISOString(),
    },
    { onConflict: 'google_place_id' },
  )
  if (error) console.warn('[places_cache]', error.message)
}

export async function getPlacesCache(
  googlePlaceId: GooglePlaceId,
): Promise<{ last_fetched: string } | null> {
  const { data } = await supabase
    .from('places_cache')
    .select('last_fetched')
    .eq('google_place_id', googlePlaceId)
    .maybeSingle()
  return data
}

export function isCacheStale(lastFetched: string | undefined): boolean {
  if (!lastFetched) return true
  return Date.now() - new Date(lastFetched).getTime() > CACHE_TTL_MS
}

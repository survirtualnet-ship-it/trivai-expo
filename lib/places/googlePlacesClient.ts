import { supabase } from '@/lib/supabase'
import { refreshPlaceFromGoogle } from './resolvePlace'
import type { GooglePlaceId, PlaceUuid } from './types'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/** Sync Google base fields into places enrichment row (Expo-side). */
export async function syncGooglePlaceToSupabase(
  placeUuid: PlaceUuid,
  googlePlaceId: GooglePlaceId,
): Promise<void> {
  try {
    await refreshPlaceFromGoogle(placeUuid, googlePlaceId)
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

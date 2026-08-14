import { supabase } from '@/lib/supabase'
import { getGooglePlaceDetails, googleResultPhotos } from '@/lib/googlePlacesApi'
import { findPlaceUuidByGoogleId } from './businessService'
import {
  isCategoryPlaceRouteId,
  isMockApiPlaceRouteId,
} from './categoryPlaceRoute'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(id: string): boolean {
  return UUID_RE.test(id)
}

export function isGooglePlaceId(id: string): boolean {
  return !!id && !isUuid(id) && id.length > 10
}

function cityFromAddress(address?: string | null): string {
  const parts = address?.split(',').map(s => s.trim()).filter(Boolean) ?? []
  return parts[parts.length - 1] ?? ''
}

/**
 * Pull live Google geometry/photos into the enrichment row so detail matches
 * the list pin (list uses Google; detail used to show stale Supabase coords).
 */
export async function refreshPlaceFromGoogle(
  placeUuid: string,
  googlePlaceId: string,
): Promise<void> {
  const details = await getGooglePlaceDetails(googlePlaceId)
  if (!details || details.lat == null || details.lng == null) return

  const photos = googleResultPhotos(details)
  const patch: Record<string, unknown> = {
    name: details.name,
    address: details.address || null,
    latitude: details.lat,
    longitude: details.lng,
    city: cityFromAddress(details.address),
    rating_avg: details.rating ?? 0,
    rating_count: details.total ?? 0,
    is_open: details.open_now ?? true,
  }
  if (photos.length > 0) {
    patch.photos = photos
  }

  const { error } = await supabase.from('places').update(patch).eq('id', placeUuid)
  if (error) {
    console.warn('[places] refresh from Google failed', error.message)
  }
}

async function refreshUuidIfLinked(placeUuid: string): Promise<void> {
  const { data } = await supabase
    .from('places')
    .select('google_place_id')
    .eq('id', placeUuid)
    .maybeSingle()

  if (!data?.google_place_id) return
  // Always refresh — list pin is live Google; keeps detail coords/photos in sync
  await refreshPlaceFromGoogle(placeUuid, data.google_place_id)
}

/**
 * Resolve route id → Supabase place UUID.
 * Creates / refreshes a lightweight enrichment shell from Google.
 */
export async function resolvePlaceUuid(routeId: string): Promise<string | null> {
  if (!routeId) return null

  // Demo / category cards — resolved via mock API, not Google enrichment.
  if (isCategoryPlaceRouteId(routeId) || isMockApiPlaceRouteId(routeId)) {
    return null
  }

  if (isUuid(routeId)) {
    await refreshUuidIfLinked(routeId)
    return routeId
  }

  const existing = await findPlaceUuidByGoogleId(routeId)
  if (existing) {
    await refreshPlaceFromGoogle(existing, routeId)
    return existing
  }

  const details = await getGooglePlaceDetails(routeId)
  if (!details) return null

  const photos = googleResultPhotos(details)

  const { data, error } = await supabase
    .from('places')
    .insert({
      name: details.name,
      address: details.address || null,
      latitude: details.lat,
      longitude: details.lng,
      google_place_id: details.place_id,
      category: 'Otros',
      city: cityFromAddress(details.address),
      photos,
      rating_avg: details.rating ?? 0,
      rating_count: details.total ?? 0,
      is_open: details.open_now ?? true,
      is_sponsored: false,
      is_featured: false,
      is_verified: false,
    })
    .select('id')
    .single()

  if (error || !data) {
    // Race: another client inserted the same google_place_id
    const raced = await findPlaceUuidByGoogleId(routeId)
    if (raced) await refreshPlaceFromGoogle(raced, routeId)
    return raced
  }
  return data.id
}

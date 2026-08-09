import { supabase } from '@/lib/supabase'
import { getGooglePlaceDetails } from '@/lib/googlePlacesApi'
import { findPlaceUuidByGoogleId } from './businessService'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(id: string): boolean {
  return UUID_RE.test(id)
}

export function isGooglePlaceId(id: string): boolean {
  return !!id && !isUuid(id) && id.length > 10
}

/**
 * Resolve route id → Supabase place UUID.
 * Creates a lightweight enrichment shell from Google when missing.
 */
export async function resolvePlaceUuid(routeId: string): Promise<string | null> {
  if (!routeId) return null
  if (isUuid(routeId)) return routeId

  const existing = await findPlaceUuidByGoogleId(routeId)
  if (existing) return existing

  const details = await getGooglePlaceDetails(routeId)
  if (!details) return null

  const { data, error } = await supabase
    .from('places')
    .insert({
      name: details.name,
      address: details.address || null,
      latitude: details.lat,
      longitude: details.lng,
      google_place_id: details.place_id,
      category: 'Otros',
      city: (() => {
        const parts = details.address?.split(',').map(s => s.trim()).filter(Boolean) ?? []
        return parts[parts.length - 1] ?? ''
      })(),
      photos: [],
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
    return findPlaceUuidByGoogleId(routeId)
  }
  return data.id
}

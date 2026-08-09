import { Platform } from 'react-native'
import { ENV } from '@/lib/env'

export type GooglePlaceResult = {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  total?: number
  open_now?: boolean | null
  types?: string[]
  photo_ref?: string | null
  /** Ready-to-use Place Photo URL(s) from the server proxy */
  photo_url?: string | null
  photos?: string[]
}

/** Prefer same-origin Expo API, then appUrl, then webApiUrl. */
function apiBases(): string[] {
  const bases: string[] = []
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    bases.push(window.location.origin)
  }
  if (ENV.appUrl) bases.push(ENV.appUrl)
  if (ENV.webApiUrl) bases.push(ENV.webApiUrl)
  return bases.filter((url, i, list) => url && list.indexOf(url) === i)
}

async function fetchGooglePlacesJson(pathQuery: string): Promise<any | null> {
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/google-places?${pathQuery}`)
      const contentType = res.headers.get('content-type') ?? ''
      if (!res.ok || !contentType.includes('json')) continue
      return await res.json()
    } catch {
      // try next base
    }
  }
  return null
}

function normalizeResult(r: GooglePlaceResult): GooglePlaceResult {
  const photos =
    r.photos?.length
      ? r.photos
      : r.photo_url
        ? [r.photo_url]
        : []
  return {
    ...r,
    photo_url: r.photo_url ?? photos[0] ?? null,
    photos,
  }
}

/** Live text search — does NOT read local DB. */
export async function searchPlaces(
  query: string,
  opts?: { lat?: number; lng?: number; radiusMeters?: number },
): Promise<GooglePlaceResult[]> {
  const q = query.trim()
  if (!q) return []

  const params = new URLSearchParams({
    q,
    mode: 'text',
  })
  if (
    opts?.lat != null &&
    opts?.lng != null &&
    Number.isFinite(opts.lat) &&
    Number.isFinite(opts.lng)
  ) {
    params.set('lat', String(opts.lat))
    params.set('lng', String(opts.lng))
    params.set('radius', String(opts.radiusMeters ?? 30000))
  }

  const data = await fetchGooglePlacesJson(params.toString())
  return ((data?.results ?? []) as GooglePlaceResult[]).map(normalizeResult)
}

/** @deprecated alias — use searchPlaces */
export async function searchGooglePlaces(q: string): Promise<GooglePlaceResult[]> {
  return searchPlaces(q)
}

/** Nearby Search around user location. */
export async function getNearbyPlacesFromGoogle(
  lat: number,
  lng: number,
  opts?: { radiusMeters?: number; keyword?: string; type?: string },
): Promise<GooglePlaceResult[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(opts?.radiusMeters ?? 3000),
  })
  if (opts?.keyword) params.set('q', opts.keyword)
  if (opts?.type) params.set('type', opts.type)

  const data = await fetchGooglePlacesJson(params.toString())
  return ((data?.results ?? []) as GooglePlaceResult[]).map(normalizeResult)
}

export async function getGooglePlaceDetails(
  placeId: string,
): Promise<GooglePlaceResult | null> {
  const data = await fetchGooglePlacesJson(
    `place_id=${encodeURIComponent(placeId)}`,
  )
  if (!data?.result) return null
  return normalizeResult(data.result as GooglePlaceResult)
}

/** Collect usable photo URLs from a Google result. */
export function googleResultPhotos(result: GooglePlaceResult | null | undefined): string[] {
  if (!result) return []
  if (result.photos?.length) return result.photos
  if (result.photo_url) return [result.photo_url]
  return []
}

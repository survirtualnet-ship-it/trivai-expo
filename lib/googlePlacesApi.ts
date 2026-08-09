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

/** Live text search — does NOT read local DB. */
export async function searchPlaces(query: string): Promise<GooglePlaceResult[]> {
  const q = query.trim()
  if (!q) return []
  const data = await fetchGooglePlacesJson(`q=${encodeURIComponent(q)}`)
  return (data?.results ?? []) as GooglePlaceResult[]
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
  return (data?.results ?? []) as GooglePlaceResult[]
}

export async function getGooglePlaceDetails(
  placeId: string,
): Promise<GooglePlaceResult | null> {
  const data = await fetchGooglePlacesJson(
    `place_id=${encodeURIComponent(placeId)}`,
  )
  return (data?.result as GooglePlaceResult) ?? null
}

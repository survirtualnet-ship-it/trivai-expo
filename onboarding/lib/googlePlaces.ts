import { Platform } from 'react-native'
import { ENV } from '@/lib/env'

export type PlaceAutocompleteResult = {
  placeId: string
  name: string
  address: string
}

export type PlaceDetails = {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
}

/**
 * Prefer same-origin Expo API, then appUrl, then webApiUrl.
 * Never call maps.googleapis.com from the client (CORS + key restrictions).
 */
function apiBases(): string[] {
  const bases: string[] = []
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    bases.push(window.location.origin)
  }
  if (ENV.appUrl) bases.push(ENV.appUrl)
  if (ENV.webApiUrl) bases.push(ENV.webApiUrl)
  return bases.filter((url, i, list) => url && list.indexOf(url) === i)
}

async function fetchPlacesProxy(pathQuery: string): Promise<any> {
  let lastError = 'No se pudo conectar con Google Places'

  for (const base of apiBases()) {
    try {
      const res = await fetch(
        `${base.replace(/\/$/, '')}/api/google-places?${pathQuery}`,
      )
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('json')) {
        lastError = 'Respuesta inválida del servidor'
        continue
      }
      const json = await res.json()
      if (!res.ok) {
        lastError =
          typeof json?.error === 'string'
            ? json.error
            : `Error ${res.status}`
        continue
      }
      return json
    } catch {
      // try next base
    }
  }

  throw new Error(lastError)
}

/** Text search via server proxy (same path as map / discover). */
export async function fetchPlaceAutocomplete(
  query: string,
): Promise<PlaceAutocompleteResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const data = await fetchPlacesProxy(
    `q=${encodeURIComponent(q)}&mode=text`,
  )
  const results = (data?.results ?? []) as {
    place_id: string
    name: string
    address?: string
  }[]

  return results.map(r => ({
    placeId: r.place_id,
    name: r.name,
    address: r.address ?? '',
  }))
}

export async function fetchPlaceDetails(
  placeId: string,
): Promise<PlaceDetails | null> {
  if (!placeId || placeId.startsWith('mock-')) return null

  const data = await fetchPlacesProxy(
    `place_id=${encodeURIComponent(placeId)}`,
  )
  const r = data?.result as
    | {
        place_id: string
        name: string
        address?: string
        lat?: number
        lng?: number
      }
    | undefined

  if (!r?.place_id || r.lat == null || r.lng == null) return null

  return {
    placeId: r.place_id,
    name: r.name,
    address: r.address ?? '',
    lat: r.lat,
    lng: r.lng,
  }
}

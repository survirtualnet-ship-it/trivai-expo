import { ENV } from '@/lib/env'

export interface GooglePlaceResult {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
}

export async function searchGooglePlaces(q: string): Promise<GooglePlaceResult[]> {
  const query = q.trim()
  if (!query) return []
  try {
    const res = await fetch(
      `${ENV.webApiUrl}/api/google-places?q=${encodeURIComponent(query)}`,
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []) as GooglePlaceResult[]
  } catch {
    return []
  }
}

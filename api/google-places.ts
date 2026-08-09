/**
 * Vercel serverless: /api/google-places
 * Keeps Google API key server-side for trivai-expo.vercel.app
 */

type VercelRequest = {
  method?: string
  query: Record<string, string | string[] | undefined>
  body?: unknown
}

type VercelResponse = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  end: () => void
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
}

function queryParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) return value[0]?.trim() || null
  return null
}

function placesKey(): string {
  return (
    process.env.GOOGLE_PLACES_KEY?.trim() ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY?.trim() ||
    ''
  )
}

function mapResult(p: any) {
  return {
    place_id: p.place_id,
    name: p.name,
    address: p.formatted_address ?? p.vicinity ?? '',
    rating: p.rating,
    total: p.user_ratings_total,
    open_now: p.opening_hours?.open_now ?? null,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    types: p.types ?? [],
    photo_ref: p.photos?.[0]?.photo_reference ?? null,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v))

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const key = placesKey()
  if (!key) {
    res.status(500).json({ error: 'API key no configurada' })
    return
  }

  if (req.method === 'POST') {
    // Sync is handled by Next.js web admin client; Expo claim uses Supabase directly.
    res.status(501).json({ error: 'POST sync usa el backend web; en Expo usa claimBusiness' })
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const q = queryParam(req.query.q)
    const placeId = queryParam(req.query.place_id)
    const lat = queryParam(req.query.lat)
    const lng = queryParam(req.query.lng)
    const radius = queryParam(req.query.radius) ?? '3000'
    const type = queryParam(req.query.type)

    if (placeId) {
      const fields =
        'place_id,name,formatted_address,geometry,rating,user_ratings_total,opening_hours,types,photos'
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&language=es&key=${key}`
      const googleRes = await fetch(url)
      const data = await googleRes.json()
      if (data.status !== 'OK') {
        res.status(502).json({ error: data.status, detail: data.error_message })
        return
      }
      res.status(200).json({ result: mapResult(data.result) })
      return
    }

    if (lat && lng) {
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius,
        language: 'es',
        key,
      })
      if (type) params.set('type', type)
      if (q) params.set('keyword', q)

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
      const googleRes = await fetch(url)
      const data = await googleRes.json()
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        res.status(502).json({ error: data.status, detail: data.error_message })
        return
      }
      res.status(200).json({
        results: (data.results ?? []).slice(0, 20).map(mapResult),
        mode: 'nearby',
      })
      return
    }

    if (!q) {
      res.status(400).json({ error: 'Falta parámetro q, lat/lng o place_id' })
      return
    }

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&language=es&key=${key}`
    const googleRes = await fetch(url)
    const data = await googleRes.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      res.status(502).json({ error: data.status, detail: data.error_message })
      return
    }
    res.status(200).json({
      results: (data.results ?? []).slice(0, 12).map(mapResult),
      mode: 'text',
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error Google Places'
    res.status(502).json({ error: message })
  }
}

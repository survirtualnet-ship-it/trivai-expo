import { supabase } from '@/lib/supabase'
import type { GooglePlaceResult } from '@/lib/googlePlacesApi'
import { upsertPlacesCache } from './googlePlacesClient'
import type { PlaceLiveContent, TrivaiBusiness } from './types'

export type TrivaiPlaceEnrichment = {
  placeUuid: string | null
  claimed: boolean
  ownerId: string | null
  reviewCount: number
  ratingAvg: number | null
  description: string | null
  photos: string[]
  live: PlaceLiveContent | null
}

export type HybridGooglePlace = GooglePlaceResult & {
  /** Prefer Supabase UUID when linked; otherwise Google place_id */
  id: string
  googlePlaceId: string
  trivai: TrivaiPlaceEnrichment | null
}

function categoryFromTypes(types: string[] | undefined): string {
  const t = types ?? []
  if (t.includes('restaurant') || t.includes('food') || t.includes('cafe')) {
    return 'Gastronomía'
  }
  if (t.includes('park')) return 'Parques'
  if (t.includes('night_club') || t.includes('movie_theater') || t.includes('museum')) {
    return 'Entretenimiento'
  }
  return 'Otros'
}

/** Batch-load Trivai enrichment keyed by google_place_id */
export async function getTrivaiDataByGoogleIds(
  googlePlaceIds: string[],
): Promise<Map<string, TrivaiPlaceEnrichment>> {
  const map = new Map<string, TrivaiPlaceEnrichment>()
  const ids = [...new Set(googlePlaceIds.filter(Boolean))]
  if (ids.length === 0) return map

  const { data: places } = await supabase
    .from('places')
    .select('id, google_place_id, rating_avg, rating_count, description, photos')
    .in('google_place_id', ids)

  const placeRows = places ?? []
  const uuidByGoogle = new Map<string, string>()
  for (const p of placeRows) {
    if (p.google_place_id) uuidByGoogle.set(p.google_place_id, p.id)
  }

  const uuids = placeRows.map(p => p.id)
  let businessByPlace = new Map<string, TrivaiBusiness>()
  let liveByPlace = new Map<string, PlaceLiveContent>()

  if (uuids.length > 0) {
    const [{ data: businesses }, { data: liveRows }] = await Promise.all([
      supabase.from('trivai_business').select('*').in('place_id', uuids),
      supabase.from('place_live_content').select('*').in('place_id', uuids),
    ])
    for (const b of businesses ?? []) {
      businessByPlace.set(b.place_id, b as TrivaiBusiness)
    }
    for (const l of liveRows ?? []) {
      liveByPlace.set(l.place_id, {
        ...l,
        tips: Array.isArray(l.tips) ? l.tips : [],
      } as PlaceLiveContent)
    }
  }

  for (const googleId of ids) {
    const uuid = uuidByGoogle.get(googleId) ?? null
    const row = placeRows.find(p => p.google_place_id === googleId)
    const biz = uuid ? businessByPlace.get(uuid) : undefined
    map.set(googleId, {
      placeUuid: uuid,
      claimed: biz?.claimed === true,
      ownerId: biz?.owner_id ?? null,
      reviewCount: row?.rating_count ?? 0,
      ratingAvg: row?.rating_avg ?? null,
      description: row?.description ?? null,
      photos: Array.isArray(row?.photos) ? row!.photos : [],
      live: uuid ? liveByPlace.get(uuid) ?? null : null,
    })
  }

  return map
}

export function mergePlaceData(
  googlePlace: GooglePlaceResult,
  trivaiData: TrivaiPlaceEnrichment | null | undefined,
): HybridGooglePlace {
  return {
    ...googlePlace,
    id: trivaiData?.placeUuid ?? googlePlace.place_id,
    googlePlaceId: googlePlace.place_id,
    trivai: trivaiData ?? null,
  }
}

export async function mergeTrivaiData(
  googlePlaces: GooglePlaceResult[],
): Promise<HybridGooglePlace[]> {
  const enrichment = await getTrivaiDataByGoogleIds(
    googlePlaces.map(p => p.place_id),
  )

  // Lightweight cache (fire-and-forget)
  void Promise.all(
    googlePlaces.slice(0, 20).map(p =>
      upsertPlacesCache({
        google_place_id: p.place_id,
        name: p.name,
        address: p.address,
        latitude: p.lat,
        longitude: p.lng,
        rating_avg: p.rating,
        rating_count: p.total,
      }),
    ),
  ).catch(() => undefined)

  return googlePlaces.map(g =>
    mergePlaceData(g, enrichment.get(g.place_id) ?? null),
  )
}

export function hybridToProductPlace(
  hybrid: HybridGooglePlace,
  origin?: { latitude: number; longitude: number } | null,
): {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
  rating: number
  description: string
  image_url: string
  is_emergency: boolean
  address: string | null
  distance_km?: number
  distance_label?: string
  google_place_id: string
  claimed: boolean
  has_trivai_content: boolean
} {
  let distance_km: number | undefined
  let distance_label: string | undefined
  if (origin && hybrid.lat != null && hybrid.lng != null) {
    distance_km = haversineKm(origin.latitude, origin.longitude, hybrid.lat, hybrid.lng)
    distance_label =
      distance_km < 1
        ? `${Math.round(distance_km * 1000)} m`
        : `${distance_km.toFixed(1)} km`
  }

  const trivai = hybrid.trivai
  const rating = trivai?.ratingAvg ?? hybrid.rating ?? 0
  const photo = trivai?.photos?.[0] ?? ''

  return {
    id: hybrid.id,
    name: hybrid.name,
    category: categoryFromTypes(hybrid.types),
    latitude: hybrid.lat,
    longitude: hybrid.lng,
    rating,
    description: trivai?.description?.trim() || '',
    image_url: photo,
    is_emergency: false,
    address: hybrid.address || null,
    distance_km,
    distance_label,
    google_place_id: hybrid.googlePlaceId,
    claimed: trivai?.claimed === true,
    has_trivai_content:
      (trivai?.reviewCount ?? 0) > 0 ||
      !!trivai?.live ||
      !!trivai?.description,
  }
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

import { supabase } from '@/services/supabase'
import type { Place, PlaceFilters } from '@/types/place'
import type { Place as DbPlace } from '@/lib/supabase'
import { EMERGENCY_CATEGORIES, PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM } from '@/lib/constants'
import {
  getNearbyPlacesFromGoogle,
  searchPlaces,
} from '@/lib/googlePlacesApi'
import {
  hybridToProductPlace,
  mergeTrivaiData,
} from '@/lib/places/mergePlace'
import { resolvePlaceUuid } from '@/lib/places/resolvePlace'

function isEmergencyCategory(category: string): boolean {
  const c = category.toLowerCase()
  return EMERGENCY_CATEGORIES.some(k => c.includes(k))
}

/**
 * Nearby places from Google + Trivai enrichment merge.
 * Does NOT depend on a global local places DB.
 */
export async function fetchNearbyPlaces(filters: PlaceFilters = {}): Promise<Place[]> {
  const {
    category,
    search,
    latitude,
    longitude,
    radiusKm = PLACES_DEFAULT_RADIUS_KM,
    limit = PLACES_DEFAULT_LIMIT,
  } = filters

  if (latitude == null || longitude == null) {
    return []
  }

  const google = await getNearbyPlacesFromGoogle(latitude, longitude, {
    radiusMeters: Math.round(radiusKm * 1000),
    keyword: search?.trim() || undefined,
  })

  if (google.length === 0) return []

  const hybrid = await mergeTrivaiData(google)
  const origin = { latitude, longitude }

  let places = hybrid
    .map(h => hybridToProductPlace(h, origin))
    .map(p => ({
      ...p,
      is_emergency: isEmergencyCategory(p.category) || p.is_emergency,
    }))

  if (category && category !== 'all') {
    const needle = category.toLowerCase()
    places = places.filter(p => p.category.toLowerCase().includes(needle))
  }

  places.sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99))
  return places.slice(0, limit)
}

/** Live Google text search + Trivai merge (biased to user location when known). */
export async function searchPlacesLive(
  query: string,
  origin?: { latitude: number; longitude: number } | null,
): Promise<Place[]> {
  const google = await searchPlaces(query, {
    lat: origin?.latitude,
    lng: origin?.longitude,
    radiusMeters: 40000,
  })
  if (google.length === 0) return []
  const hybrid = await mergeTrivaiData(google)
  return hybrid.map(h =>
    hybridToProductPlace(
      h,
      origin ? { latitude: origin.latitude, longitude: origin.longitude } : null,
    ),
  )
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

export function mapDbPlaceToPlace(
  row: Pick<
    DbPlace,
    | 'id'
    | 'name'
    | 'category'
    | 'description'
    | 'latitude'
    | 'longitude'
    | 'rating_avg'
    | 'photos'
    | 'address'
    | 'google_place_id'
  >,
  origin?: { latitude: number; longitude: number } | null,
): Place | null {
  if (row.latitude == null || row.longitude == null) return null

  let distance_km: number | undefined
  let distance_label: string | undefined
  if (origin) {
    distance_km = haversineKm(
      origin.latitude,
      origin.longitude,
      row.latitude,
      row.longitude,
    )
    distance_label =
      distance_km < 1
        ? `${Math.round(distance_km * 1000)} m`
        : `${distance_km.toFixed(1)} km`
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: row.rating_avg ?? 0,
    description: row.description?.trim() || '',
    image_url: row.photos?.[0] ?? '',
    is_emergency: isEmergencyCategory(row.category),
    address: row.address,
    distance_km,
    distance_label,
    google_place_id: row.google_place_id ?? null,
  }
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const uuid = await resolvePlaceUuid(id)
  if (!uuid) return null
  const { data, error } = await supabase
    .from('places')
    .select(
      'id,name,category,description,latitude,longitude,rating_avg,photos,address,google_place_id',
    )
    .eq('id', uuid)
    .maybeSingle()
  if (error || !data) return null
  return mapDbPlaceToPlace(data as DbPlace)
}

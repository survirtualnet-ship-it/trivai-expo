import { supabase } from '@/services/supabase'
import type { Place, PlaceFilters } from '@/types/place'
import { EMERGENCY_CATEGORIES, PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM } from '@/lib/constants'
import type { Place as DbPlace } from '@/lib/supabase'

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
    Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

function isEmergencyCategory(category: string): boolean {
  const c = category.toLowerCase()
  return EMERGENCY_CATEGORIES.some(k => c.includes(k))
}

/** Map Supabase row → product Place */
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
  >,
  origin?: { latitude: number; longitude: number } | null,
): Place | null {
  if (row.latitude == null || row.longitude == null) return null

  let distance_km: number | undefined
  let distance_label: string | undefined
  if (origin) {
    distance_km = haversineKm(origin.latitude, origin.longitude, row.latitude, row.longitude)
    distance_label = formatDistance(distance_km)
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
  }
}

const PLACE_SELECT =
  'id,name,category,description,latitude,longitude,rating_avg,photos,address'

/**
 * Fetch nearby places from Supabase `places` table.
 * Filters client-side by radius when coords are provided.
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

  let q = supabase
    .from('places')
    .select(PLACE_SELECT)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (category && category !== 'all') {
    q = q.ilike('category', `%${category}%`)
  }
  if (search?.trim()) {
    q = q.ilike('name', `%${search.trim()}%`)
  }

  q = q.order('rating_avg', { ascending: false }).limit(Math.max(limit * 3, 60))

  const { data, error } = await q
  if (error) throw error

  const origin =
    latitude != null && longitude != null
      ? { latitude, longitude }
      : null

  let places = (data ?? [])
    .map(row => mapDbPlaceToPlace(row as DbPlace, origin))
    .filter((p): p is Place => !!p)

  if (origin) {
    places = places
      .filter(p => (p.distance_km ?? 0) <= radiusKm)
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
  }

  return places.slice(0, limit)
}

export async function fetchPlaceById(id: string): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places')
    .select(PLACE_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapDbPlaceToPlace(data as DbPlace)
}

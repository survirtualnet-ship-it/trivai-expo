import { supabase, type Place } from '@/lib/supabase'
import { dedupePlaces } from '@/lib/places'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

export const PLACE_CARD_SELECT =
  'id,name,category,address,rating_avg,rating_count,is_open,hours,latitude,longitude,photos,is_featured,is_sponsored'

export const PLACE_LIST_SELECT = PLACE_CARD_SELECT

export const PLACE_MAP_SELECT = 'id,name,category,latitude,longitude'

export interface PlacesListFilters {
  category?: string
  limit?: number
  from?: number
  to?: number
  search?: string
  withCoords?: boolean
}

export interface PlaceMapMarker {
  id: string
  name: string
  category: string
  lat: number
  lng: number
}

/**
 * @deprecated Prefer Google hybrid (`fetchNearbyPlaces` / `searchPlacesLive`).
 * Kept for enrichment-only / admin paths that already have local rows.
 */
export async function fetchPlacesList(filters: PlacesListFilters = {}): Promise<PlaceCardData[]> {
  const { category, limit = 200, from, to, search, withCoords = true } = filters

  let q = supabase
    .from('places')
    .select(PLACE_CARD_SELECT)

  if (withCoords) q = q.not('latitude', 'is', null).not('longitude', 'is', null)
  if (category) q = q.eq('category', category)
  if (search) q = q.ilike('name', `%${search}%`)

  q = q.order('rating_avg', { ascending: false })

  const { data, error } =
    typeof from === 'number' && typeof to === 'number'
      ? await q.range(from, to)
      : await q.limit(limit)

  if (error) throw error
  return dedupePlaces((data ?? []) as PlaceCardData[])
}

export async function fetchPlaceById(id: string): Promise<Place> {
  const { resolveCategoryPlaceRouteId } = await import('@/lib/places/categoryPlaceRoute')
  const routeId = resolveCategoryPlaceRouteId(id)

  const { resolvePlaceUuid } = await import('@/lib/places/resolvePlace')
  const uuid = await resolvePlaceUuid(routeId)

  if (uuid) {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('id', uuid)
      .maybeSingle()
    if (data) return data as Place
  }

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', routeId)
    .maybeSingle()

  if (data) return data as Place

  if (routeId !== id) {
    const { data: legacy } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (legacy) return legacy as Place
  }

  try {
    const { fetchPlaceAsSupabase } = await import('@/services/mockApi')
    return await fetchPlaceAsSupabase(routeId)
  } catch {
    if (routeId !== id) {
      try {
        const { fetchPlaceAsSupabase } = await import('@/services/mockApi')
        return await fetchPlaceAsSupabase(id)
      } catch {
        // fall through
      }
    }
    if (error) throw error
    throw new Error(`Place not found: ${id}`)
  }
}

export async function fetchPlacesMapMarkers(): Promise<PlaceMapMarker[]> {
  const { data, error } = await supabase
    .from('places')
    .select(PLACE_MAP_SELECT)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)

  if (error) throw error
  return (data ?? []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    lat: p.latitude as number,
    lng: p.longitude as number,
  }))
}

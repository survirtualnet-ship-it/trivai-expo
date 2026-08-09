import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { placeToItem, sortByRating } from '@/lib/home/placeMapper'
import { CACHE_KEYS, CACHE_TTL, readCache, writeCache } from '@/lib/homeCache'
import { PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM, QUERY_KEYS } from '@/lib/constants'
import { fetchNearbyPlaces } from '@/services/places.service'
import type { UserLocationProfile } from '@/services/locationService'
import { filterByZone, type PlaceItem, type ZoneId } from '@/src/data/mock'
import type { Place } from '@/types/place'

const SECTION_LIMIT = 8

function take(items: PlaceItem[], limit = SECTION_LIMIT): PlaceItem[] {
  return items.slice(0, limit)
}

function sectionByZone(
  items: PlaceItem[],
  zone: ZoneId | null,
): PlaceItem[] {
  if (!zone) return take(items)
  const filtered = filterByZone(items, zone)
  return take(filtered.length > 0 ? filtered : items)
}

async function loadPlaces(lat: number, lng: number): Promise<Place[]> {
  try {
    const places = await fetchNearbyPlaces({
      latitude: lat,
      longitude: lng,
      radiusKm: PLACES_DEFAULT_RADIUS_KM,
      limit: PLACES_DEFAULT_LIMIT,
    })
    if (places.length > 0) {
      await writeCache(CACHE_KEYS.places, places)
      return places
    }
  } catch (err) {
    console.warn('[home] Google nearby failed', err)
  }

  // Offline fallback only — never Santa Cruz mocks
  const cached = await readCache<Place[]>(CACHE_KEYS.places)
  return cached ?? []
}

export function useNearbyPlaces(
  profile: UserLocationProfile | undefined,
  zone: ZoneId | null,
) {
  const lat = profile?.latitude
  const lng = profile?.longitude

  const query = useQuery({
    queryKey: [...QUERY_KEYS.places, 'home-sections', lat, lng],
    queryFn: () => loadPlaces(lat!, lng!),
    enabled: lat != null && lng != null,
    staleTime: CACHE_TTL.places,
  })

  const sections = useMemo(() => {
    const raw = query.data ?? []
    const userLat = lat ?? 0
    const userLng = lng ?? 0

    if (raw.length === 0) {
      return {
        nearby: [] as PlaceItem[],
        trending: [] as PlaceItem[],
        forYou: [] as PlaceItem[],
        recommended: [] as PlaceItem[],
        totalCount: 0,
        isEmpty: true,
        isMock: false,
      }
    }

    const items = raw.map(p => placeToItem(p, userLat, userLng))
    const byDistance = [...items]
    const byRating = sortByRating(raw, userLat, userLng)
    const forYouPool = raw
      .filter(p => (p.distance_km ?? 99) <= 5)
      .sort((a, b) => b.rating - a.rating)
      .map(p => placeToItem(p, userLat, userLng))

    return {
      nearby: take(byDistance),
      trending: sectionByZone(byRating, zone),
      forYou: sectionByZone(
        forYouPool.length ? forYouPool : byRating,
        zone,
      ),
      recommended: sectionByZone(byRating, zone),
      totalCount: raw.length,
      isEmpty: false,
      isMock: false,
    }
  }, [query.data, lat, lng, zone])

  return {
    ...sections,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    refresh: query.refetch,
  }
}

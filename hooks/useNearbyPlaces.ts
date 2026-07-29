import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { placeToItem, sortByRating } from '@/lib/home/placeMapper'
import { CACHE_KEYS, CACHE_TTL, readCache, writeCache } from '@/lib/homeCache'
import { PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM, QUERY_KEYS } from '@/lib/constants'
import { fetchNearbyPlaces } from '@/services/places.service'
import type { UserLocationProfile } from '@/services/locationService'
import {
  filterByZone,
  FOR_YOU_PLACES,
  NEARBY_PLACES,
  RECOMMENDED_PLACES,
  TRENDING_PLACES,
  type PlaceItem,
  type ZoneId,
} from '@/src/data/mock'
import type { Place } from '@/types/place'

const SECTION_LIMIT = 7

function mockPool(): PlaceItem[] {
  const seen = new Set<string>()
  const merged = [
    ...NEARBY_PLACES,
    ...TRENDING_PLACES,
    ...FOR_YOU_PLACES,
    ...RECOMMENDED_PLACES,
  ]
  return merged.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
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
  } catch {
    // fall through to cache / mock
  }

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
    const useMock = raw.length === 0
    const userLat = lat ?? 0
    const userLng = lng ?? 0

    if (useMock) {
      return {
        nearby: filterByZone(NEARBY_PLACES, zone).slice(0, SECTION_LIMIT),
        trending: filterByZone(TRENDING_PLACES, zone).slice(0, SECTION_LIMIT),
        forYou: filterByZone(FOR_YOU_PLACES, zone).slice(0, SECTION_LIMIT),
        recommended: filterByZone(RECOMMENDED_PLACES, zone).slice(0, SECTION_LIMIT),
        totalCount: mockPool().length,
        isMock: true,
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
      nearby: filterByZone(byDistance, zone).slice(0, SECTION_LIMIT),
      trending: filterByZone(byRating, zone).slice(0, SECTION_LIMIT),
      forYou: filterByZone(forYouPool.length ? forYouPool : byRating, zone).slice(
        0,
        SECTION_LIMIT,
      ),
      recommended: filterByZone(byRating, zone).slice(0, SECTION_LIMIT),
      totalCount: raw.length,
      isMock: false,
    }
  }, [query.data, lat, lng, zone])

  return {
    ...sections,
    isLoading: query.isLoading && !query.data,
    refresh: query.refetch,
  }
}

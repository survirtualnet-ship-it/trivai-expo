import type { ExploreCategoryId, ExplorePlace } from '@/lib/explore/types'
import { EXPLORE_CATEGORIES } from '@/lib/explore/mockPlaces'
import { fetchNearbyPlaces, searchPlacesLive } from '@/services/places.service'
import type { Place } from '@/types/place'
import { PLACES_DEFAULT_LIMIT, PLACES_DEFAULT_RADIUS_KM } from '@/lib/constants'

const CATEGORY_KEYWORDS: Record<Exclude<ExploreCategoryId, 'all'>, string> = {
  restaurants: 'restaurant',
  cafes: 'cafe coffee',
  beauty: 'beauty salon spa',
  health: 'hospital clinic doctor',
  pharmacy: 'pharmacy',
  emergency: 'hospital emergency',
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&q=80'

function mapCategory(raw: string): ExploreCategoryId {
  const c = raw.toLowerCase()
  if (c.includes('cafe') || c.includes('coffee')) return 'cafes'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa')) return 'beauty'
  if (c.includes('pharm')) return 'pharmacy'
  if (c.includes('emerg') || c.includes('hospital')) return 'emergency'
  if (c.includes('health') || c.includes('clinic') || c.includes('doctor')) return 'health'
  if (
    c.includes('restaurant')
    || c.includes('gastro')
    || c.includes('food')
    || c.includes('bar')
  ) {
    return 'restaurants'
  }
  return 'restaurants'
}

function toExplorePlace(place: Place): ExplorePlace {
  const category = mapCategory(place.category)
  const label =
    EXPLORE_CATEGORIES.find(c => c.id === category)?.label ?? place.category
  return {
    id: place.id,
    name: place.name,
    category,
    categoryLabel: label,
    latitude: place.latitude,
    longitude: place.longitude,
    rating: place.rating,
    distance: place.distance_label ?? '—',
    image: place.image_url || FALLBACK_IMG,
    address: place.address ?? undefined,
  }
}

/** Google nearby/search + Trivai merge for Explore tab. */
export async function fetchExplorePlaces(
  category: ExploreCategoryId = 'all',
  search = '',
  coords?: { latitude: number; longitude: number } | null,
): Promise<ExplorePlace[]> {
  const q = search.trim()

  let places: Place[]
  if (q.length >= 2) {
    places = await searchPlacesLive(q, coords)
  } else if (coords) {
    places = await fetchNearbyPlaces({
      latitude: coords.latitude,
      longitude: coords.longitude,
      radiusKm: PLACES_DEFAULT_RADIUS_KM,
      limit: PLACES_DEFAULT_LIMIT,
      search: category === 'all' ? undefined : CATEGORY_KEYWORDS[category],
    })
  } else {
    return []
  }

  const mapped = places.map(toExplorePlace)
  if (category === 'all') return mapped
  return mapped.filter(p => p.category === category)
}

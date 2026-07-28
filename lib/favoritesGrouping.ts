import type { PlaceCardData } from '@/components/ui/PlaceCard'
import { normalizeCategory } from '@/lib/categories'

export type FavoriteGroupId = 'restaurants' | 'cafes' | 'hotels'

export interface FavoriteGroup {
  id: FavoriteGroupId
  title: string
  emoji: string
  places: PlaceCardData[]
}

const GROUP_META: Record<FavoriteGroupId, { title: string; emoji: string }> = {
  restaurants: { title: 'Restaurants', emoji: '🍽️' },
  cafes: { title: 'Cafes', emoji: '☕' },
  hotels: { title: 'Hotels', emoji: '🏨' },
}

const CAFE_PATTERN = /caf[eé]|coffee|kaffe|espresso|matcha|panader[ií]a|bakery|latte/i
const HOTEL_PATTERN = /hotel|hostal|hostel|suites|resort|lodg|inn|hospedaje/i
const RESTAURANT_PATTERN = /restaur|parrill|pizzer|sushi|grill|bistro|steak|comida|kitchen|bar\b/i

export function classifyFavoritePlace(place: PlaceCardData): FavoriteGroupId {
  const name = place.name.toLowerCase()
  const cat = normalizeCategory(place.category)
  const legacy = (place.category ?? '').toLowerCase()

  if (HOTEL_PATTERN.test(name) || legacy.includes('hotel')) {
    return 'hotels'
  }

  if (
    CAFE_PATTERN.test(name)
    || legacy.includes('cafeter')
    || legacy.includes('café')
  ) {
    return 'cafes'
  }

  if (
    cat === 'Gastronomía'
    || RESTAURANT_PATTERN.test(name)
    || legacy.includes('restaur')
    || legacy.includes('bar')
  ) {
    return 'restaurants'
  }

  if (cat === 'Otros' && HOTEL_PATTERN.test(name)) {
    return 'hotels'
  }

  // Default food-related Supabase category → restaurants
  if (cat === 'Gastronomía') return 'restaurants'

  // Other saved places (parks, entertainment) → restaurants bucket as general "places"
  return 'restaurants'
}

export function groupFavoritePlaces(places: PlaceCardData[]): FavoriteGroup[] {
  const buckets: Record<FavoriteGroupId, PlaceCardData[]> = {
    restaurants: [],
    cafes: [],
    hotels: [],
  }

  for (const place of places) {
    buckets[classifyFavoritePlace(place)].push(place)
  }

  return (Object.keys(GROUP_META) as FavoriteGroupId[])
    .filter(id => buckets[id].length > 0)
    .map(id => ({
      id,
      ...GROUP_META[id],
      places: buckets[id],
    }))
}

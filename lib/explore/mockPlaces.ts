import type { ExploreCategory, ExplorePlace } from '@/lib/explore/types'

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: 'all', label: 'Todos', emoji: '✨' },
  { id: 'restaurants', label: 'Restaurants', emoji: '🍔' },
  { id: 'cafes', label: 'Cafes', emoji: '☕' },
  { id: 'beauty', label: 'Beauty', emoji: '💇' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { id: 'emergency', label: 'Emergency', emoji: '🚑' },
]

/** @deprecated Explore uses Google hybrid via `fetchExplorePlaces`. */
export const EXPLORE_MOCK_PLACES: ExplorePlace[] = []

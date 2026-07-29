/** Explore screen domain types (TRIVAI) */

export type ExploreCategoryId =
  | 'all'
  | 'restaurants'
  | 'cafes'
  | 'beauty'
  | 'health'
  | 'pharmacy'
  | 'emergency'

export type ExplorePlace = {
  id: string
  name: string
  category: ExploreCategoryId
  categoryLabel: string
  latitude: number
  longitude: number
  rating: number
  distance: string
  image: string
  address?: string
}

export type ExploreViewMode = 'list' | 'map'

export type ExploreCategory = {
  id: ExploreCategoryId
  label: string
  emoji: string
}

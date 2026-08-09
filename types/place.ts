/** Domain Place model for TRIVAI product surfaces */

export type PlaceCategory =
  | 'restaurants'
  | 'cafes'
  | 'beauty'
  | 'health'
  | 'pharmacy'
  | 'emergency'
  | 'gastronomia'
  | 'entretenimiento'
  | 'parques'
  | 'otros'
  | string

export type Place = {
  id: string
  name: string
  category: string
  latitude: number
  longitude: number
  rating: number
  description: string
  image_url: string
  is_emergency: boolean
  address?: string | null
  distance_km?: number
  distance_label?: string
  google_place_id?: string | null
  claimed?: boolean
  has_trivai_content?: boolean
}

export type PlaceFilters = {
  category?: string
  search?: string
  latitude?: number
  longitude?: number
  /** Default 12 km */
  radiusKm?: number
  limit?: number
}

import type { MapPlace } from '../store/useMapStore'

/** Neutral map center when GPS / places are unavailable. */
export const MAP_CITY_CENTER = {
  lat: 0,
  lng: 0,
}

/** @deprecated use MAP_CITY_CENTER */
export const MADRID_CENTER = MAP_CITY_CENTER

export const MOCK_MAP_PLACES: MapPlace[] = []

export const SEARCH_SUGGESTIONS = [
  'Café cerca',
  'Eventos esta noche',
  'Restaurantes',
  'Parques cerca',
  'Bares trending',
  'Plan al aire libre',
]

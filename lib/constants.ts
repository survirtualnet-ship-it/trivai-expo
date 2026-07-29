/** App-wide constants for TRIVAI */

export const APP_NAME = 'TRIVAI'

export const DEFAULT_CITY = 'Santa Cruz de la Sierra'
export const DEFAULT_COUNTRY = 'Bolivia'

/** Fallback map center — Santa Cruz */
export const DEFAULT_COORDS = {
  latitude: -17.7833,
  longitude: -63.1821,
} as const

export const LOCATION_WATCH_INTERVAL_MS = 60_000
export const PLACES_STALE_MS = 60_000
export const PLACES_DEFAULT_RADIUS_KM = 12
export const PLACES_DEFAULT_LIMIT = 40

export const QUERY_KEYS = {
  auth: ['auth'] as const,
  places: ['places'] as const,
  favorites: ['favorites'] as const,
  activity: ['activity'] as const,
  location: ['location'] as const,
} as const

export const EMERGENCY_CATEGORIES = [
  'emergency',
  'pharmacy',
  'health',
  'hospital',
  'farmacia',
] as const

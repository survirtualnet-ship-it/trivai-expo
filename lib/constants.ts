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
  home: {
    weather: ['home', 'weather'] as const,
    currency: ['home', 'currency'] as const,
    notifications: ['home', 'notifications'] as const,
    news: ['home', 'news'] as const,
  },
} as const

export const CACHE_TTL = {
  weather: 45 * 60_000,
  currency: 24 * 60 * 60_000,
  places: 60 * 60_000,
  news: 30 * 60_000,
} as const

export const EMERGENCY_CATEGORIES = [
  'emergency',
  'pharmacy',
  'health',
  'hospital',
  'farmacia',
] as const

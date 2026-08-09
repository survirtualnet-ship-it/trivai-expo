/** App-wide constants for TRIVAI */

export const APP_NAME = 'TRIVAI'

/** Neutral labels when city is unknown — never a specific country. */
export const UNKNOWN_CITY_ES = 'Tu ciudad'
export const UNKNOWN_CITY_EN = 'Your city'

/**
 * @deprecated Do not use as GPS substitute. Prefer real coords or null.
 * Kept only for rare type-compat call sites that must pass a number pair.
 */
export const DEFAULT_COORDS = {
  latitude: 0,
  longitude: 0,
} as const

/** @deprecated Prefer profile/GPS city — empty means unknown. */
export const DEFAULT_CITY = ''
/** @deprecated Prefer reverse-geocoded country — empty means unknown. */
export const DEFAULT_COUNTRY = ''

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

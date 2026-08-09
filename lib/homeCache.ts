import AsyncStorage from '@react-native-async-storage/async-storage'

const PREFIX = '@trivai/home/'

export type CacheEntry<T> = {
  data: T
  savedAt: number
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    return parsed.data
  } catch {
    return null
  }
}

export async function readCacheEntry<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

export async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() }
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // ignore storage errors
  }
}

export function isFresh(savedAt: number, ttlMs: number): boolean {
  return Date.now() - savedAt < ttlMs
}

/** True when `savedAt` falls on the same local calendar day as `now`. */
export function isSameLocalDay(savedAt: number, now = Date.now()): boolean {
  const a = new Date(savedAt)
  const b = new Date(now)
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Local calendar key, e.g. `2026-8-3` — changes at midnight. */
export function localDateKey(now = Date.now()): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Milliseconds until the next local midnight (min 1s). */
export function msUntilNextLocalMidnight(now = Date.now()): number {
  const d = new Date(now)
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return Math.max(1_000, next.getTime() - now)
}

export const CACHE_KEYS = {
  location: 'location',
  weather: 'weather',
  currency: 'currency',
  places: 'places',
  manualCity: 'manual_city',
  news: 'news',
} as const

export const CACHE_TTL = {
  weather: 45 * 60_000,
  /** Rolling fallback; currency freshness is calendar-day via `isSameLocalDay`. */
  currency: 24 * 60 * 60_000,
  places: 60 * 60_000,
  news: 30 * 60_000,
} as const

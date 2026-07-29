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

export const CACHE_KEYS = {
  location: 'location',
  weather: 'weather',
  currency: 'currency',
  places: 'places',
  manualCity: 'manual_city',
} as const

export const CACHE_TTL = {
  weather: 45 * 60_000,
  currency: 24 * 60 * 60_000,
  places: 60 * 60_000,
} as const

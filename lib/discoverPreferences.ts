import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { normalizeCategory, type Category } from '@/lib/categories'

export interface DiscoverLocationPreference {
  city?: string | null
  lat?: number | null
  lng?: number | null
  radiusKm?: number
}

export interface DiscoverPreferences {
  categories: Category[]
  priceMin: number | null
  priceMax: number | null
  location: DiscoverLocationPreference | null
}

export const EMPTY_DISCOVER_PREFERENCES: DiscoverPreferences = {
  categories: [],
  priceMin: null,
  priceMax: null,
  location: null,
}

const storageKey = (userId: string) => `trivai_discover_prefs_${userId}`

export function hasActiveDiscoverPreferences(prefs: DiscoverPreferences | null | undefined): boolean {
  if (!prefs) return false
  if (prefs.categories.length > 0) return true
  if (prefs.priceMin != null || prefs.priceMax != null) return true
  if (prefs.location?.city) return true
  if (prefs.location?.lat != null && prefs.location?.lng != null) return true
  return false
}

function parseCategories(raw: unknown): Category[] {
  if (!Array.isArray(raw)) return []
  const out: Category[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    out.push(normalizeCategory(item))
  }
  return [...new Set(out)]
}

function parseNumber(raw: unknown): number | null {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return raw
}

function prefsFromRecord(raw: Partial<DiscoverPreferences> | null | undefined): DiscoverPreferences {
  if (!raw) return { ...EMPTY_DISCOVER_PREFERENCES }
  return {
    categories: parseCategories(raw.categories),
    priceMin: raw.priceMin ?? null,
    priceMax: raw.priceMax ?? null,
    location: raw.location ?? null,
  }
}

function prefsFromAuthMetadata(meta: Record<string, unknown>): DiscoverPreferences {
  const hasMeta =
    meta.discover_categories != null ||
    meta.discover_price_min != null ||
    meta.discover_price_max != null ||
    meta.discover_lat != null ||
    meta.discover_lng != null ||
    meta.discover_city != null

  if (!hasMeta) return { ...EMPTY_DISCOVER_PREFERENCES }

  const lat = parseNumber(meta.discover_lat)
  const lng = parseNumber(meta.discover_lng)
  const city = typeof meta.discover_city === 'string' ? meta.discover_city : null

  return {
    categories: parseCategories(meta.discover_categories),
    priceMin: parseNumber(meta.discover_price_min),
    priceMax: parseNumber(meta.discover_price_max),
    location: lat != null && lng != null
      ? { lat, lng, city, radiusKm: 8 }
      : city
        ? { city, radiusKm: 8 }
        : null,
  }
}

async function loadStoredPrefs(userId: string): Promise<DiscoverPreferences | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId))
    if (!raw) return null
    return prefsFromRecord(JSON.parse(raw) as Partial<DiscoverPreferences>)
  } catch {
    return null
  }
}

function topCategories(counts: Map<Category, number>, limit = 3): Category[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cat]) => cat)
}

function tallyCategory(counts: Map<Category, number>, category: string | null | undefined) {
  if (!category) return
  const cat = normalizeCategory(category)
  counts.set(cat, (counts.get(cat) ?? 0) + 1)
}

async function inferPreferencesFromBehavior(userId: string): Promise<Partial<DiscoverPreferences>> {
  const [favsRes, reviewsRes, attendeesRes, profileRes] = await Promise.all([
    supabase
      .from('favorites')
      .select('place:places(category)')
      .eq('user_id', userId)
      .limit(40),
    supabase
      .from('reviews')
      .select('rating, place:places(category)')
      .eq('user_id', userId)
      .gte('rating', 4)
      .limit(30),
    supabase
      .from('event_attendees')
      .select('event:events(category, price, is_free)')
      .eq('user_id', userId)
      .eq('status', 'going')
      .limit(30),
    supabase
      .from('profiles')
      .select('city, business_lat, business_lng')
      .eq('id', userId)
      .maybeSingle(),
  ])

  const categoryCounts = new Map<Category, number>()
  for (const row of favsRes.data ?? []) {
    tallyCategory(categoryCounts, (row as any).place?.category)
  }
  for (const row of reviewsRes.data ?? []) {
    tallyCategory(categoryCounts, (row as any).place?.category)
  }
  for (const row of attendeesRes.data ?? []) {
    tallyCategory(categoryCounts, (row as any).event?.category)
  }

  const paidPrices: number[] = []
  let prefersFree = false
  for (const row of attendeesRes.data ?? []) {
    const event = (row as any).event
    if (!event) continue
    if (event.is_free) {
      prefersFree = true
      continue
    }
    if (typeof event.price === 'number' && event.price >= 0) {
      paidPrices.push(event.price)
    }
  }

  let priceMin: number | null = null
  let priceMax: number | null = null
  if (paidPrices.length >= 2) {
    priceMin = Math.min(...paidPrices)
    priceMax = Math.max(...paidPrices)
  } else if (prefersFree && paidPrices.length === 0) {
    priceMin = 0
    priceMax = 0
  } else if (paidPrices.length === 1) {
    priceMin = 0
    priceMax = paidPrices[0] * 1.5
  }

  const profile = profileRes.data as {
    city?: string | null
    business_lat?: number | null
    business_lng?: number | null
  } | null

  let location: DiscoverLocationPreference | null = null
  if (profile?.business_lat != null && profile?.business_lng != null) {
    location = {
      lat: profile.business_lat,
      lng: profile.business_lng,
      city: profile.city ?? null,
      radiusKm: 8,
    }
  } else if (profile?.city) {
    location = { city: profile.city, radiusKm: 8 }
  }

  const categories = topCategories(categoryCounts)
  const partial: Partial<DiscoverPreferences> = {}
  if (categories.length) partial.categories = categories
  if (priceMin != null || priceMax != null) {
    partial.priceMin = priceMin
    partial.priceMax = priceMax
  }
  if (location) partial.location = location
  return partial
}

function mergePreferences(
  explicit: DiscoverPreferences,
  inferred: Partial<DiscoverPreferences>,
): DiscoverPreferences {
  return {
    categories: explicit.categories.length > 0 ? explicit.categories : (inferred.categories ?? []),
    priceMin: explicit.priceMin ?? inferred.priceMin ?? null,
    priceMax: explicit.priceMax ?? inferred.priceMax ?? null,
    location: explicit.location ?? inferred.location ?? null,
  }
}

/** Preferencias de discover para usuarios autenticados; null si no hay señales útiles. */
export async function loadDiscoverPreferences(userId: string): Promise<DiscoverPreferences | null> {
  const [stored, sessionRes, inferred] = await Promise.all([
    loadStoredPrefs(userId),
    supabase.auth.getSession(),
    inferPreferencesFromBehavior(userId),
  ])

  const meta = sessionRes.data.session?.user?.id === userId
    ? (sessionRes.data.session.user.user_metadata ?? {})
    : {}

  const fromMeta = prefsFromAuthMetadata(meta as Record<string, unknown>)
  const explicit = hasActiveDiscoverPreferences(fromMeta)
    ? fromMeta
    : (stored ?? { ...EMPTY_DISCOVER_PREFERENCES })
  const merged = mergePreferences(explicit, inferred)

  return hasActiveDiscoverPreferences(merged) ? merged : null
}

export async function saveDiscoverPreferences(
  userId: string,
  prefs: DiscoverPreferences,
): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(prefs))
  await supabase.auth.updateUser({
    data: {
      discover_categories: prefs.categories,
      discover_price_min: prefs.priceMin,
      discover_price_max: prefs.priceMax,
      discover_lat: prefs.location?.lat ?? null,
      discover_lng: prefs.location?.lng ?? null,
      discover_city: prefs.location?.city ?? null,
    },
  })
}

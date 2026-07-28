import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = '@trivai/recent_searches'
const MAX = 8

export async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

export async function addRecentSearch(query: string): Promise<string[]> {
  const trimmed = query.trim()
  if (!trimmed) return loadRecentSearches()

  const prev = await loadRecentSearches()
  const next = [trimmed, ...prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX)

  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* ignore */ }

  return next
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY)
  } catch { /* ignore */ }
}

export async function removeRecentSearch(query: string): Promise<string[]> {
  const prev = await loadRecentSearches()
  const next = prev.filter(s => s !== query)
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* ignore */ }
  return next
}

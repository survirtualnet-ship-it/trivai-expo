import AsyncStorage from '@react-native-async-storage/async-storage'
import { ANALYTICS_SESSION_KEY } from './constants'

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

let memorySessionId: string | null = null

/** Rotating anonymous session — no PII. */
export async function getAnonymousSessionId(): Promise<string> {
  if (memorySessionId) return memorySessionId

  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_SESSION_KEY)
    if (stored) {
      memorySessionId = stored
      return stored
    }
  } catch {
    // fall through
  }

  const id = randomId()
  memorySessionId = id
  try {
    await AsyncStorage.setItem(ANALYTICS_SESSION_KEY, id)
  } catch {
    // non-fatal
  }
  return id
}

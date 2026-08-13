import { supabase } from '@/lib/supabase'
import { EVENT_TYPE_SET } from './constants'
import { getAnonymousSessionId } from './session'
import type { TrackBusinessEventInput } from './types'

const pendingQueue: TrackBusinessEventInput[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function sanitizeMetadata(
  metadata?: TrackBusinessEventInput['metadata'],
): Record<string, string | number | boolean> {
  if (!metadata) return {}
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value
    }
  }
  return out
}

async function insertEvent(
  input: TrackBusinessEventInput,
  anonymousId: string,
): Promise<void> {
  if (!input.businessId || !EVENT_TYPE_SET.has(input.eventType)) return

  const row = {
    business_id: input.businessId,
    google_place_id: input.googlePlaceId ?? null,
    user_id: input.userId ?? null,
    anonymous_id: input.userId ? null : anonymousId,
    event_type: input.eventType,
    country: input.country ?? null,
    city: input.city ?? null,
    metadata: sanitizeMetadata(input.metadata),
  }

  const { error } = await supabase.from('business_events').insert(row)
  if (error && __DEV__) {
    console.warn('[trackBusinessEvent]', error.message)
  }
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flushEventQueue()
  }, 400)
}

async function flushEventQueue(): Promise<void> {
  if (pendingQueue.length === 0) return
  const batch = pendingQueue.splice(0, pendingQueue.length)
  const anonymousId = await getAnonymousSessionId()
  await Promise.allSettled(batch.map(item => insertEvent(item, anonymousId)))
}

/**
 * Fire-and-forget business event tracking.
 * Works for authenticated and anonymous tourists (Privacy by Design).
 */
export function trackBusinessEvent(input: TrackBusinessEventInput): void {
  if (!input.businessId) return
  pendingQueue.push(input)
  scheduleFlush()
}

/** Await persistence — use in tests or critical paths. */
export async function trackBusinessEventAsync(
  input: TrackBusinessEventInput,
): Promise<void> {
  const anonymousId = await getAnonymousSessionId()
  await insertEvent(input, anonymousId)
}

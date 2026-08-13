import { supabase } from '@/lib/supabase'
import type { BusinessEventRow, EventCountMap } from './types'

export type DateRange = {
  from: Date
  to: Date
}

export function toIso(d: Date): string {
  return d.toISOString()
}

export function periodRange(period: 'today' | 'week' | 'month'): DateRange {
  const to = new Date()
  const from = new Date()
  if (period === 'today') {
    from.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    from.setDate(from.getDate() - 7)
  } else {
    from.setDate(from.getDate() - 30)
  }
  return { from, to }
}

export function previousPeriodRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - durationMs),
    to: new Date(range.from.getTime()),
  }
}

/** Raw event counts via RPC (owner RLS). Returns {} if table/RPC missing. */
export async function fetchEventCounts(
  businessId: string,
  range: DateRange,
): Promise<EventCountMap> {
  const { data, error } = await supabase.rpc('aggregate_business_events', {
    p_business_id: businessId,
    p_from: toIso(range.from),
    p_to: toIso(range.to),
  })

  if (error) {
    if (__DEV__) console.warn('[fetchEventCounts]', error.message)
    return fallbackCountEvents(businessId, range)
  }

  return normalizeCountMap(data)
}

async function fallbackCountEvents(
  businessId: string,
  range: DateRange,
): Promise<EventCountMap> {
  const { data, error } = await supabase
    .from('business_events')
    .select('event_type')
    .eq('business_id', businessId)
    .gte('created_at', toIso(range.from))
    .lt('created_at', toIso(range.to))

  if (error || !data) return {}

  const map: EventCountMap = {}
  for (const row of data) {
    const t = row.event_type as string
    map[t] = (map[t] ?? 0) + 1
  }
  return map
}

function normalizeCountMap(raw: unknown): EventCountMap {
  if (!raw || typeof raw !== 'object') return {}
  const map: EventCountMap = {}
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof val === 'number' ? val : Number(val)
    if (!Number.isNaN(n)) map[key] = n
  }
  return map
}

export type DailySeriesRow = {
  metric_date: string
  event_type: string
  event_count: number
}

export async function fetchDailySeries(
  businessId: string,
  fromDate: string,
  toDate: string,
  eventTypes?: string[],
): Promise<DailySeriesRow[]> {
  const { data, error } = await supabase.rpc('business_events_daily_series', {
    p_business_id: businessId,
    p_from: fromDate,
    p_to: toDate,
    p_event_types: eventTypes ?? null,
  })

  if (error) {
    if (__DEV__) console.warn('[fetchDailySeries]', error.message)
    return []
  }

  return (data ?? []) as DailySeriesRow[]
}

export async function fetchRecentBusinessEvents(
  businessId: string,
  limit = 10,
): Promise<Pick<BusinessEventRow, 'id' | 'event_type' | 'created_at' | 'metadata'>[]> {
  const { data, error } = await supabase.rpc('business_recent_events', {
    p_business_id: businessId,
    p_limit: limit,
  })

  if (error) {
    if (__DEV__) console.warn('[fetchRecentBusinessEvents]', error.message)
    const { data: rows } = await supabase
      .from('business_events')
      .select('id, event_type, created_at, metadata')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (rows ?? []) as Pick<
      BusinessEventRow,
      'id' | 'event_type' | 'created_at' | 'metadata'
    >[]
  }

  return (data ?? []) as Pick<
    BusinessEventRow,
    'id' | 'event_type' | 'created_at' | 'metadata'
  >[]
}

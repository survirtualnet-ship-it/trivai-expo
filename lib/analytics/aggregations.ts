import {
  ACTIVITY_EVENT_LABELS,
  CONTACT_EVENT_TYPES,
  METRIC_EVENT_MAP,
  METRIC_LABELS,
  FREE_METRIC_KEYS,
  PRO_METRIC_KEYS,
} from './constants'
import {
  fetchDailySeries,
  fetchEventCounts,
  fetchRecentBusinessEvents,
  periodRange,
  previousPeriodRange,
  type DateRange,
} from './queries'
import type {
  BusinessActivityItem,
  BusinessDashboardData,
  BusinessMetric,
  BusinessMetricKey,
  DashboardStats,
  EventCountMap,
  MetricPeriod,
} from './types'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'

function sumEventTypes(map: EventCountMap, types: string[]): number {
  return types.reduce((acc, t) => acc + (map[t] ?? 0), 0)
}

function metricValue(map: EventCountMap, key: BusinessMetricKey): number {
  return sumEventTypes(map, METRIC_EVENT_MAP[key])
}

function changePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function buildMetricsFromMaps(
  current: EventCountMap,
  previous: EventCountMap,
  keys: BusinessMetricKey[],
): BusinessMetric[] {
  return keys.map(key => {
    const value = metricValue(current, key)
    const prev = metricValue(previous, key)
    const meta = METRIC_LABELS[key]
    return {
      key,
      label: meta.label,
      value,
      changePercent: changePercent(value, prev),
      icon: meta.icon,
    }
  })
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} minuto${mins === 1 ? '' : 's'}`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? '' : 's'}`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days === 1 ? '' : 's'}`
}

function mapActivity(
  rows: Awaited<ReturnType<typeof fetchRecentBusinessEvents>>,
): BusinessActivityItem[] {
  return rows.map(row => ({
    id: row.id,
    timeAgo: formatTimeAgo(row.created_at),
    title:
      ACTIVITY_EVENT_LABELS[row.event_type as keyof typeof ACTIVITY_EVENT_LABELS] ??
      row.event_type,
    description:
      typeof row.metadata?.product_name === 'string'
        ? row.metadata.product_name
        : undefined,
  }))
}

function buildWeeklyViews(series: Awaited<ReturnType<typeof fetchDailySeries>>): number[] {
  const byDate = new Map<string, number>()
  for (const row of series) {
    if (row.event_type !== 'VIEW_PLACE' && row.event_type !== 'VIEW_BUSINESS') continue
    const d = row.metric_date
    byDate.set(d, (byDate.get(d) ?? 0) + Number(row.event_count))
  }
  const sorted = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b))
  const last7 = sorted.slice(-7).map(([, c]) => c)
  while (last7.length < 7) last7.unshift(0)
  return last7
}

function buildHourlyActivity(
  businessId: string,
  range: DateRange,
): Promise<number[]> {
  // Hourly buckets require raw events — simplified: return zeros until volume warrants
  void businessId
  void range
  return Promise.resolve(Array.from({ length: 24 }, () => 0))
}

function computeCtr(map: EventCountMap): number {
  const views = metricValue(map, 'views')
  if (views === 0) return 0
  const contacts = sumEventTypes(map, CONTACT_EVENT_TYPES)
  return Math.round((contacts / views) * 1000) / 10
}

function buildStats(map: EventCountMap, weeklyViews: number[], rating: number): DashboardStats {
  const clicks =
    metricValue(map, 'whatsapp') +
    metricValue(map, 'calls') +
    metricValue(map, 'web') +
    metricValue(map, 'directions')
  return {
    views: metricValue(map, 'views'),
    clicks,
    saves: metricValue(map, 'favorites'),
    rating,
    weeklyViews,
  }
}

export function metricKeysForTier(tier: BusinessSubscriptionTier): BusinessMetricKey[] {
  if (tier === 'premium' || tier === 'pro') return PRO_METRIC_KEYS
  return FREE_METRIC_KEYS
}

export async function fetchBusinessDashboard(
  businessId: string,
  period: MetricPeriod,
  tier: BusinessSubscriptionTier,
  rating: number,
): Promise<BusinessDashboardData> {
  const range = periodRange(period)
  const prevRange = previousPeriodRange(range)

  const [current, previous, recent, series] = await Promise.all([
    fetchEventCounts(businessId, range),
    fetchEventCounts(businessId, prevRange),
    fetchRecentBusinessEvents(businessId, 8),
    fetchDailySeries(
      businessId,
      formatDate(range.from),
      formatDate(range.to),
      ['VIEW_PLACE', 'VIEW_BUSINESS'],
    ),
  ])

  const keys = metricKeysForTier(tier)
  const metrics = buildMetricsFromMaps(current, previous, keys)
  const weeklyViews = buildWeeklyViews(series)
  const stats = buildStats(current, weeklyViews, rating)
  const activity = mapActivity(recent)

  const data: BusinessDashboardData = { metrics, stats, activity }

  if (tier === 'pro' || tier === 'premium') {
    data.ctr = computeCtr(current)
    data.hourlyActivity = await buildHourlyActivity(businessId, range)
  }

  if (tier === 'premium') {
    data.insightsReady = false
  }

  return data
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Empty dashboard when events table unavailable or no data yet. */
export function emptyDashboard(rating: number, tier: BusinessSubscriptionTier): BusinessDashboardData {
  const keys = metricKeysForTier(tier)
  const metrics = keys.map(key => ({
    key,
    ...METRIC_LABELS[key],
    value: 0,
    changePercent: 0,
  }))
  return {
    metrics,
    stats: {
      views: 0,
      clicks: 0,
      saves: 0,
      rating,
      weeklyViews: [0, 0, 0, 0, 0, 0, 0],
    },
    activity: [],
  }
}

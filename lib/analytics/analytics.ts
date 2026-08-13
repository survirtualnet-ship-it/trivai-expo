/**
 * Business analytics — event tracking, queries, dashboard aggregations.
 * @see BUSINESS_EVENTS_ARCHITECTURE.md
 */

export type {
  BusinessEventType,
  BusinessEventMetadata,
  BusinessEventRow,
  TrackBusinessEventInput,
  MetricPeriod,
  BusinessMetricKey,
  BusinessMetric,
  BusinessActivityItem,
  DashboardStats,
  BusinessDashboardData,
  EventCountMap,
  HealthScoreFactor,
  BusinessHealthResult,
  GrowthRecommendation,
} from './types'

export {
  BUSINESS_EVENT_TYPES,
  METRIC_EVENT_MAP,
  FREE_METRIC_KEYS,
  PRO_METRIC_KEYS,
  METRIC_LABELS,
  ACTIVITY_EVENT_LABELS,
  CONTACT_EVENT_TYPES,
} from './constants'

export { trackBusinessEvent, trackBusinessEventAsync } from './trackEvent'
export { getAnonymousSessionId } from './session'

export {
  fetchEventCounts,
  fetchDailySeries,
  fetchRecentBusinessEvents,
  periodRange,
  previousPeriodRange,
} from './queries'

export {
  fetchBusinessDashboard,
  emptyDashboard,
  metricKeysForTier,
} from './aggregations'

import type { BusinessEventMetadata, BusinessEventType } from './types'
import { trackBusinessEvent as track } from './trackEvent'

/** Convenience wrapper for place detail instrumentation. */
export function trackPlaceEvent(
  placeId: string,
  googlePlaceId: string | null | undefined,
  eventType: BusinessEventType,
  options?: {
    userId?: string | null
    city?: string | null
    country?: string | null
    metadata?: BusinessEventMetadata
  },
): void {
  track({
    businessId: placeId,
    googlePlaceId,
    eventType,
    userId: options?.userId,
    city: options?.city,
    country: options?.country,
    metadata: options?.metadata,
  })
}

/**
 * @deprecated Import from `@/lib/analytics/analytics` instead.
 * Re-exports for backward compatibility during migration.
 */
export {
  trackBusinessEvent,
  trackBusinessEventAsync,
  trackPlaceEvent,
  type BusinessEventType,
  type TrackBusinessEventInput,
} from '@/lib/analytics/analytics'

/** Legacy names — map to business events where applicable. */
export type AnonymousAnalyticsEvent =
  | 'screen_view'
  | 'place_impression'
  | 'place_click'
  | 'place_detail_open'
  | 'map_marker_tap'
  | 'search_query'
  | 'search_result_click'
  | 'directions_tap'
  | 'whatsapp_tap'
  | 'website_tap'
  | 'phone_tap'
  | 'session_duration'
  | 'category_browse'

export type AuthenticatedAnalyticsEvent =
  | 'favorite_add'
  | 'favorite_remove'
  | 'review_create'
  | 'review_report'
  | 'activity_share'
  | 'friend_request'
  | 'event_rsvp'
  | 'business_claim_start'
  | 'business_claim_complete'
  | 'return_visit'

export function trackAnonymousEvent(): void {
  // Legacy stub — use trackBusinessEvent / trackPlaceEvent
}

export function trackAuthenticatedEvent(): void {
  // Legacy stub — use trackBusinessEvent / trackPlaceEvent
}

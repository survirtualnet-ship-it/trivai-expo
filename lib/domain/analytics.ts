/**
 * Analytics event taxonomy — architecture only (no pipeline implemented).
 * Separates anonymous telemetry from authenticated user actions.
 */

/** Anonymous — no user_id; aggregate only. */
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

/** Authenticated — tied to profiles.id. */
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

export type AnalyticsEventName =
  | AnonymousAnalyticsEvent
  | AuthenticatedAnalyticsEvent

export type AnalyticsPayload = {
  event: AnalyticsEventName
  timestamp: string
  sessionId?: string
  userId?: string | null
  placeId?: string
  googlePlaceId?: string
  metadata?: Record<string, string | number | boolean>
}

/** Stub — wire to Supabase / analytics provider later. */
export function trackAnonymousEvent(
  event: AnonymousAnalyticsEvent,
  metadata?: AnalyticsPayload['metadata'],
): void {
  if (__DEV__) {
    console.debug('[analytics:anonymous]', event, metadata)
  }
}

export function trackAuthenticatedEvent(
  event: AuthenticatedAnalyticsEvent,
  userId: string,
  metadata?: AnalyticsPayload['metadata'],
): void {
  if (__DEV__) {
    console.debug('[analytics:auth]', event, userId, metadata)
  }
}

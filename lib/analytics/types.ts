/** Central event taxonomy — extend without schema migrations. */
export type BusinessEventType =
  | 'VIEW_PLACE'
  | 'VIEW_BUSINESS'
  | 'OPEN_MAP'
  | 'DIRECTIONS'
  | 'PHONE_CLICK'
  | 'WHATSAPP_CLICK'
  | 'WEBSITE_CLICK'
  | 'FAVORITE'
  | 'SHARE'
  | 'REVIEW_CREATED'
  | 'REVIEW_RESPONSE'
  | 'PROMOTION_VIEW'
  | 'PROMOTION_CLICK'
  | 'PRODUCT_CLICK'
  | 'MENU_VIEW'

export type BusinessEventMetadata = Record<
  string,
  string | number | boolean | null | undefined
>

export type BusinessEventRow = {
  id: string
  created_at: string
  business_id: string
  google_place_id: string | null
  user_id: string | null
  anonymous_id: string | null
  event_type: BusinessEventType
  country: string | null
  city: string | null
  metadata: BusinessEventMetadata
}

export type TrackBusinessEventInput = {
  businessId: string
  googlePlaceId?: string | null
  eventType: BusinessEventType
  userId?: string | null
  country?: string | null
  city?: string | null
  metadata?: BusinessEventMetadata
}

export type MetricPeriod = 'today' | 'week' | 'month'

export type BusinessMetricKey =
  | 'views'
  | 'directions'
  | 'whatsapp'
  | 'calls'
  | 'web'
  | 'favorites'
  | 'reviews'
  | 'shares'

export type BusinessMetric = {
  key: BusinessMetricKey
  label: string
  value: number
  changePercent: number
  icon: string
}

export type BusinessActivityItem = {
  id: string
  timeAgo: string
  title: string
  description?: string
}

export type DashboardStats = {
  views: number
  clicks: number
  saves: number
  rating: number
  weeklyViews: number[]
}

export type BusinessDashboardData = {
  metrics: BusinessMetric[]
  stats: DashboardStats
  activity: BusinessActivityItem[]
  /** PRO+: CTR views → contact actions */
  ctr?: number
  /** PRO+: top products by PRODUCT_CLICK */
  topProducts?: { productId: string; name: string; clicks: number }[]
  /** PRO+: hourly activity buckets 0–23 */
  hourlyActivity?: number[]
  /** PREMIUM placeholder — wired later */
  insightsReady?: boolean
}

export type EventCountMap = Record<string, number>

export type HealthScoreFactor =
  | 'profile_complete'
  | 'hours'
  | 'photos'
  | 'description'
  | 'products'
  | 'contact'
  | 'review_responses'
  | 'promotions'
  | 'recent_activity'

export type BusinessHealthResult = {
  score: number
  maxScore: number
  factors: Partial<Record<HealthScoreFactor, { score: number; max: number; hint?: string }>>
  /** Algorithm TBD — placeholder weights */
  isPlaceholder: boolean
}

export type GrowthRecommendation = {
  id: string
  title: string
  impact: 'high' | 'medium' | 'low'
  priority: number
  action: string
  deepLink?: string
  evidence?: string
}

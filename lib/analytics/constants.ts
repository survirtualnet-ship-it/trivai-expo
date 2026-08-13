import type { BusinessEventType, BusinessMetricKey, MetricPeriod } from './types'

/** All supported event types — single registry for validation and docs. */
export const BUSINESS_EVENT_TYPES: readonly BusinessEventType[] = [
  'VIEW_PLACE',
  'VIEW_BUSINESS',
  'OPEN_MAP',
  'DIRECTIONS',
  'PHONE_CLICK',
  'WHATSAPP_CLICK',
  'WEBSITE_CLICK',
  'FAVORITE',
  'SHARE',
  'REVIEW_CREATED',
  'REVIEW_RESPONSE',
  'PROMOTION_VIEW',
  'PROMOTION_CLICK',
  'PRODUCT_CLICK',
  'MENU_VIEW',
] as const

export const EVENT_TYPE_SET = new Set<string>(BUSINESS_EVENT_TYPES)

/** Map dashboard metric keys → underlying event types. */
export const METRIC_EVENT_MAP: Record<BusinessMetricKey, BusinessEventType[]> = {
  views: ['VIEW_PLACE', 'VIEW_BUSINESS'],
  directions: ['DIRECTIONS', 'OPEN_MAP'],
  whatsapp: ['WHATSAPP_CLICK'],
  calls: ['PHONE_CLICK'],
  web: ['WEBSITE_CLICK'],
  favorites: ['FAVORITE'],
  reviews: ['REVIEW_CREATED'],
  shares: ['SHARE'],
}

/** FREE tier — limited dashboard cards. */
export const FREE_METRIC_KEYS: BusinessMetricKey[] = [
  'views',
  'directions',
  'whatsapp',
  'favorites',
  'reviews',
]

/** PRO tier — full metric grid + charts. */
export const PRO_METRIC_KEYS: BusinessMetricKey[] = [
  'views',
  'directions',
  'whatsapp',
  'calls',
  'web',
  'favorites',
  'reviews',
  'shares',
]

export const METRIC_LABELS: Record<
  BusinessMetricKey,
  { label: string; icon: string }
> = {
  views: { label: 'Visualizaciones', icon: 'eye' },
  directions: { label: 'Cómo llegar', icon: 'navigation' },
  whatsapp: { label: 'WhatsApp', icon: 'message-circle' },
  calls: { label: 'Llamadas', icon: 'phone' },
  web: { label: 'Clicks Web', icon: 'globe' },
  favorites: { label: 'Favoritos', icon: 'heart' },
  reviews: { label: 'Reseñas', icon: 'star' },
  shares: { label: 'Compartidos', icon: 'share-2' },
}

export const PERIOD_DAYS: Record<MetricPeriod, number> = {
  today: 1,
  week: 7,
  month: 30,
}

export const ACTIVITY_EVENT_LABELS: Partial<Record<BusinessEventType, string>> = {
  VIEW_PLACE: 'Nueva visualización del perfil',
  VIEW_BUSINESS: 'Nueva visualización del negocio',
  OPEN_MAP: 'Usuario abrió el mapa',
  DIRECTIONS: 'Solicitud de cómo llegar',
  PHONE_CLICK: 'Nuevo clic en llamar',
  WHATSAPP_CLICK: 'Nuevo clic en WhatsApp',
  WEBSITE_CLICK: 'Nuevo clic en sitio web',
  FAVORITE: 'Nuevo favorito',
  SHARE: 'Perfil compartido',
  REVIEW_CREATED: 'Nueva reseña',
  REVIEW_RESPONSE: 'Respuesta publicada',
  PROMOTION_VIEW: 'Promoción vista',
  PROMOTION_CLICK: 'Clic en promoción',
  PRODUCT_CLICK: 'Clic en producto',
  MENU_VIEW: 'Menú consultado',
}

export const ANALYTICS_SESSION_KEY = 'trivai-analytics-session-id'

/** Contact events used for CTR (PRO). */
export const CONTACT_EVENT_TYPES: BusinessEventType[] = [
  'WHATSAPP_CLICK',
  'PHONE_CLICK',
  'WEBSITE_CLICK',
  'DIRECTIONS',
]

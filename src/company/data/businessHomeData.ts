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

export type BusinessPromotion = {
  id: string
  title: string
  status: 'active' | 'scheduled' | 'ended'
  endsAt: string
  clicks: number
}

const PERIOD_SCALE: Record<MetricPeriod, number> = {
  today: 1,
  week: 4.2,
  month: 14,
}

export function buildBusinessMetrics(period: MetricPeriod): BusinessMetric[] {
  const s = PERIOD_SCALE[period]
  return [
    { key: 'views', label: 'Visualizaciones', value: Math.round(128 * s), changePercent: 12, icon: 'eye' },
    { key: 'directions', label: 'Cómo llegar', value: Math.round(34 * s), changePercent: 8, icon: 'navigation' },
    { key: 'whatsapp', label: 'WhatsApp', value: Math.round(21 * s), changePercent: 15, icon: 'message-circle' },
    { key: 'calls', label: 'Llamadas', value: Math.round(12 * s), changePercent: -3, icon: 'phone' },
    { key: 'web', label: 'Clicks Web', value: Math.round(18 * s), changePercent: 5, icon: 'globe' },
    { key: 'favorites', label: 'Favoritos', value: Math.round(9 * s), changePercent: 22, icon: 'heart' },
    { key: 'reviews', label: 'Reseñas', value: Math.round(4 * s), changePercent: 10, icon: 'star' },
    { key: 'shares', label: 'Compartidos', value: Math.round(6 * s), changePercent: 7, icon: 'share-2' },
  ]
}

export const MOCK_BUSINESS_ACTIVITY: BusinessActivityItem[] = [
  { id: 'a1', timeAgo: 'Hace 5 minutos', title: 'Nuevo favorito' },
  { id: 'a2', timeAgo: 'Hace 12 minutos', title: 'Nueva reseña' },
  { id: 'a3', timeAgo: 'Hace 30 minutos', title: '4 usuarios solicitaron cómo llegar' },
  { id: 'a4', timeAgo: 'Hace 45 minutos', title: 'Nuevo clic en WhatsApp' },
  { id: 'a5', timeAgo: 'Hace 1 hora', title: 'Producto actualizado' },
]

export const MOCK_PROMOTIONS: BusinessPromotion[] = [
  {
    id: 'p1',
    title: '2x1 en brunch de fin de semana',
    status: 'active',
    endsAt: 'Dom 18:00',
    clicks: 142,
  },
  {
    id: 'p2',
    title: 'Happy hour · café + postre',
    status: 'scheduled',
    endsAt: 'Vie 17:00',
    clicks: 0,
  },
]

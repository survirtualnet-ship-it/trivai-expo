import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import { esHoy } from '@/lib/eventUtils'
import type { AppLocale } from '@/lib/i18n/discover'
import { DISCOVER_STRINGS, categoryLabel } from '@/lib/i18n/discover'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'

export type DiscoverBadge = 'hoy' | 'evento' | 'popular' | 'recommended' | 'sponsored'

export function firstPhoto(photos?: string[] | null): string | null {
  const uri = photos?.[0]
  if (typeof uri !== 'string') return null
  const trimmed = uri.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function placeBadge(place: PlaceCardData): DiscoverBadge | null {
  if (place.is_featured) return 'recommended'
  if (place.is_sponsored) return 'sponsored'
  if ((place.rating_avg ?? 0) >= 4.5) return 'popular'
  return null
}

export function eventBadge(event: EventCardData & { is_featured?: boolean | null }): DiscoverBadge | null {
  if (event.is_featured) return 'recommended'
  if (esHoy(event.start_datetime)) return 'hoy'
  if ((event.attendees_count ?? 0) >= 8) return 'popular'
  return 'evento'
}

export function badgeLabel(badge: DiscoverBadge, locale: AppLocale): string {
  const es: Record<DiscoverBadge, string> = {
    hoy: 'HOY',
    evento: 'EVENTO',
    popular: 'POPULAR',
    recommended: 'RECOMENDADO',
    sponsored: 'PATROCINADO',
  }
  const en: Record<DiscoverBadge, string> = {
    hoy: 'TODAY',
    evento: 'EVENT',
    popular: 'POPULAR',
    recommended: 'RECOMMENDED',
    sponsored: 'SPONSORED',
  }
  return (locale === 'es' ? es : en)[badge]
}

export function catDisplay(cat: string, locale: AppLocale): string {
  return locale === 'es' ? getCatLabel(cat) : categoryLabel(cat, locale)
}

export function minutesLabel(place: PlaceCardData, locale: AppLocale): string | null {
  if (place._dist == null) return null
  const m = distToMinutes(place._dist)
  const t = DISCOVER_STRINGS[locale]
  return `${m} ${t.min}`
}

export function zoneLabel(zone: string | null | undefined, locale: AppLocale): string | null {
  if (!zone) return null
  const t = DISCOVER_STRINGS[locale]
  return `${t.zone} ${zone}`
}

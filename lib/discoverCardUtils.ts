import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import { esHoy } from '@/lib/eventUtils'
import type { AppLocale } from '@/lib/i18n/discover'
import { DISCOVER_STRINGS, categoryLabel } from '@/lib/i18n/discover'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'

export type DiscoverBadge = 'hoy' | 'evento' | 'popular'

export function firstPhoto(photos?: string[] | null): string | null {
  return photos?.[0] ?? null
}

export function placeBadge(place: PlaceCardData): DiscoverBadge | null {
  if ((place.rating_avg ?? 0) >= 4.5) return 'popular'
  return null
}

export function eventBadge(event: EventCardData): DiscoverBadge | null {
  if (esHoy(event.start_datetime)) return 'hoy'
  if ((event.attendees_count ?? 0) >= 8) return 'popular'
  return 'evento'
}

export function badgeLabel(badge: DiscoverBadge, locale: AppLocale): string {
  const es: Record<DiscoverBadge, string> = {
    hoy: 'HOY',
    evento: 'EVENTO',
    popular: 'POPULAR',
  }
  const en: Record<DiscoverBadge, string> = {
    hoy: 'TODAY',
    evento: 'EVENT',
    popular: 'POPULAR',
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

import { getCatLabel } from '@/lib/tokens'
import { calcIsOpen } from '@/lib/hours'
import type { AppLocale } from '@/lib/i18n/discover'
import { categoryLabel } from '@/lib/i18n/discover'

import type { CityZone } from '@/lib/zones'

export type PlaceCardData = {
  id: string
  name: string
  category: string
  address?: string | null
  rating_avg?: number
  rating_count?: number
  is_open?: boolean
  hours?: Record<string, string> | null
  latitude?: number | null
  longitude?: number | null
  _dist?: number
  _zone?: CityZone | null
  photos?: string[] | null
  is_featured?: boolean
  is_sponsored?: boolean
  description?: string | null
}

export function derivePlaceCardTags(
  place: PlaceCardData,
  locale: AppLocale = 'es',
): string[] {
  const tags: string[] = []
  const cat = locale === 'es'
    ? getCatLabel(place.category)
    : categoryLabel(place.category, locale)

  tags.push(cat)
  if (place.is_featured) tags.push(locale === 'es' ? 'Destacado' : 'Featured')
  if (place.is_sponsored) tags.push(locale === 'es' ? 'Patrocinado' : 'Sponsored')
  if (calcIsOpen(place.hours, place.is_open ?? false)) {
    tags.push(locale === 'es' ? 'Abierto' : 'Open')
  }

  return [...new Set(tags)].slice(0, 3)
}

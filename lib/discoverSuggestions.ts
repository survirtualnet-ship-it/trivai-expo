import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import { CATEGORIES, normalizeCategory, type Category } from '@/lib/categories'
import type { EnrichedPlace, EnrichedEvent } from '@/lib/discoverFilters'

export type DiscoverSuggestion =
  | { kind: 'place'; data: EnrichedPlace }
  | { kind: 'event'; data: EnrichedEvent }

const SECTION_SIZE = 16
const PER_CATEGORY = 4

function emptyBuckets(): Record<Category, DiscoverSuggestion[]> {
  return {
    Gastronomía: [],
    Entretenimiento: [],
    Parques: [],
    Otros: [],
  }
}

/** Mezcla round-robin: Gastronomía → Entretenimiento → Parques → Otros → … */
function interleaveBuckets(buckets: Record<Category, DiscoverSuggestion[]>, limit = SECTION_SIZE): DiscoverSuggestion[] {
  const out: DiscoverSuggestion[] = []
  let round = 0
  while (out.length < limit) {
    let added = false
    for (const cat of CATEGORIES) {
      const item = buckets[cat][round]
      if (item) {
        out.push(item)
        added = true
        if (out.length >= limit) break
      }
    }
    if (!added) break
    round++
  }
  return out
}

function placeQuality(p: EnrichedPlace): number {
  const rating = p.rating_avg ?? 0
  return rating * 10
}

function eventQuality(e: EnrichedEvent): number {
  return (e.attendees_count ?? 0) * 2
}

function placeDistance(p: EnrichedPlace): number {
  return p._dist ?? Number.POSITIVE_INFINITY
}

function eventDistance(e: EnrichedEvent): number {
  return e._dist ?? Number.POSITIVE_INFINITY
}

function toSuggestions(
  places: EnrichedPlace[],
  events: EnrichedEvent[],
): DiscoverSuggestion[] {
  return [
    ...places.map(data => ({ kind: 'place' as const, data })),
    ...events.map(data => ({ kind: 'event' as const, data })),
  ]
}

function bucketByCategory(items: DiscoverSuggestion[]): Record<Category, DiscoverSuggestion[]> {
  const buckets = emptyBuckets()
  for (const item of items) {
    const cat = normalizeCategory(
      item.kind === 'place' ? item.data.category : item.data.category,
    )
    buckets[cat].push(item)
  }
  return buckets
}

/**
 * Cerca de ti: 16 sugerencias mezcladas (4 por categoría),
 * priorizando lo más cercano al usuario.
 */
export function buildCercaDeTi(
  places: EnrichedPlace[],
  events: EnrichedEvent[],
  limit = SECTION_SIZE,
): DiscoverSuggestion[] {
  const all = toSuggestions(places, events)

  const buckets = bucketByCategory(all)
  for (const cat of CATEGORIES) {
    buckets[cat].sort((a, b) => {
      const distA = a.kind === 'place' ? placeDistance(a.data) : eventDistance(a.data)
      const distB = b.kind === 'place' ? placeDistance(b.data) : eventDistance(b.data)
      if (distA !== distB) return distA - distB
      const qA = a.kind === 'place' ? placeQuality(a.data) : eventQuality(a.data)
      const qB = b.kind === 'place' ? placeQuality(b.data) : eventQuality(b.data)
      return qB - qA
    })
    buckets[cat] = buckets[cat].slice(0, PER_CATEGORY)
  }

  return interleaveBuckets(buckets, limit)
}

/**
 * Más destacados: 16 sugerencias mezcladas (4 por categoría),
 * priorizando los mejores de la ciudad (rating / asistentes).
 */
export function buildMasDestacados(
  places: EnrichedPlace[],
  events: EnrichedEvent[],
  limit = SECTION_SIZE,
): DiscoverSuggestion[] {
  const all = toSuggestions(places, events)

  const buckets = bucketByCategory(all)
  for (const cat of CATEGORIES) {
    buckets[cat].sort((a, b) => {
      const qA = a.kind === 'place' ? placeQuality(a.data) : eventQuality(a.data)
      const qB = b.kind === 'place' ? placeQuality(b.data) : eventQuality(b.data)
      return qB - qA
    })
    buckets[cat] = buckets[cat].slice(0, PER_CATEGORY)
  }

  return interleaveBuckets(buckets, limit)
}

export function suggestionKey(s: DiscoverSuggestion): string {
  return `${s.kind}-${s.data.id}`
}

export function topFeaturedEvent(events: EnrichedEvent[]): EnrichedEvent | null {
  if (!events.length) return null
  return [...events].sort((a, b) => eventQuality(b) - eventQuality(a))[0]
}

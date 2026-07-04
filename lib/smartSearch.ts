import { supabase } from '@/lib/supabase'
import { dedupePlaces } from '@/lib/places'
import { getCatEmoji } from '@/lib/tokens'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'

export type SearchPerson = {
  id: string
  nombre: string
  usuario: string
  ini: string
}

export type SearchSuggestion = {
  id: string
  type: 'lugar' | 'evento' | 'persona'
  title: string
  subtitle: string
  emoji: string
  href: string
}

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Coincidencia aproximada: contiene texto o todas las palabras del query */
export function matchesSearch(text: string | null | undefined, query: string): boolean {
  const q = normalizeForSearch(query)
  if (!q) return true
  if (!text) return false
  const target = normalizeForSearch(text)
  if (target.includes(q)) return true
  const words = q.split(/\s+/).filter(Boolean)
  return words.every(word => target.includes(word))
}

export function filterPlacesByQuery(places: PlaceCardData[], query: string): PlaceCardData[] {
  const q = query.trim()
  if (!q) return places
  return places.filter(p =>
    matchesSearch(p.name, q) ||
    matchesSearch(p.category, q) ||
    matchesSearch(p.address, q),
  )
}

export function filterEventsByQuery(events: EventCardData[], query: string): EventCardData[] {
  const q = query.trim()
  if (!q) return events
  return events.filter(e =>
    matchesSearch(e.name, q) ||
    matchesSearch(e.category, q) ||
    matchesSearch(e.place?.name, q) ||
    matchesSearch(e.place?.address, q),
  )
}

function mergePlaces(local: PlaceCardData[], remote: PlaceCardData[]): PlaceCardData[] {
  return dedupePlaces([...local, ...remote])
}

function mergeEvents(local: EventCardData[], remote: EventCardData[]): EventCardData[] {
  const seen = new Set<string>()
  const out: EventCardData[] = []
  for (const item of [...local, ...remote]) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}

export function mergeSearchPlaces(
  allPlaces: PlaceCardData[],
  remotePlaces: PlaceCardData[],
  query: string,
): PlaceCardData[] {
  const q = query.trim()
  if (!q) return allPlaces
  return mergePlaces(filterPlacesByQuery(allPlaces, q), remotePlaces)
}

export function mergeSearchEvents(
  allEvents: EventCardData[],
  remoteEvents: EventCardData[],
  query: string,
): EventCardData[] {
  const q = query.trim()
  if (!q) return allEvents
  return mergeEvents(filterEventsByQuery(allEvents, q), remoteEvents)
}

export async function fetchSmartSearchResults(query: string): Promise<{
  lugares: PlaceCardData[]
  eventos: EventCardData[]
  personas: SearchPerson[]
}> {
  const q = query.trim()
  if (!q) return { lugares: [], eventos: [], personas: [] }

  const [{ data: lug }, { data: evt }, { data: per }] = await Promise.all([
    supabase
      .from('places')
      .select('id,name,category,address,rating_avg,is_open,hours,latitude,longitude')
      .or(`name.ilike.%${q}%,category.ilike.%${q}%,address.ilike.%${q}%`)
      .limit(12),
    supabase
      .from('events')
      .select('id,name,category,start_datetime,is_free,price,attendees_count,place:places(name,address,latitude,longitude)')
      .ilike('name', `%${q}%`)
      .eq('is_active', true)
      .gte('start_datetime', new Date().toISOString())
      .limit(12),
    supabase
      .from('profiles')
      .select('id, full_name, username')
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(8),
  ])

  return {
    lugares: dedupePlaces(lug ?? []),
    eventos: (evt ?? []).map((e: any) => ({ ...e, attendees_count: e.attendees_count ?? 0 })),
    personas: (per ?? []).map((p: any) => ({
      id: p.id,
      nombre: p.full_name ?? p.username ?? 'Usuario',
      usuario: p.username ?? '',
      ini: (p.full_name ?? p.username ?? 'U')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    })),
  }
}

export function buildSearchSuggestions(
  places: PlaceCardData[],
  events: EventCardData[],
  personas: SearchPerson[],
  query: string,
  limit = 6,
): SearchSuggestion[] {
  const q = query.trim()
  if (!q) return []

  const items: SearchSuggestion[] = []

  for (const p of places.slice(0, 3)) {
    items.push({
      id: `l-${p.id}`,
      type: 'lugar',
      title: p.name,
      subtitle: p.category,
      emoji: getCatEmoji(p.category),
      href: `/lugares/${p.id}`,
    })
  }
  for (const e of events.slice(0, 3)) {
    items.push({
      id: `e-${e.id}`,
      type: 'evento',
      title: e.name,
      subtitle: e.category,
      emoji: getCatEmoji(e.category),
      href: `/eventos/${e.id}`,
    })
  }
  for (const person of personas.slice(0, 2)) {
    items.push({
      id: `p-${person.id}`,
      type: 'persona',
      title: person.nombre,
      subtitle: person.usuario ? `@${person.usuario}` : 'Persona',
      emoji: '👤',
      href: `/perfil/${person.id}`,
    })
  }

  return items.slice(0, limit)
}

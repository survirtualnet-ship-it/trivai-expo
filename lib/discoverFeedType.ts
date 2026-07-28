import type { DiscoverRankingMode } from '@/lib/discoverRanking'
import {
  enrichAllEvents,
  enrichAllPlaces,
  type EnrichedEvent,
  type EnrichedPlace,
} from '@/lib/discoverFilters'
import {
  buildCercaDeTi,
  type DiscoverSuggestion,
} from '@/lib/discoverSuggestions'
import type { Coords } from '@/lib/geolocation'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'

export type DiscoverFeedType = 'discover' | 'for_you' | 'trending' | 'nearby'

export const HOME_PREVIEW_LIMIT = 8

const SC_CENTER: Coords = { lat: -17.7833, lng: -63.1821 }

export function isDiscoverPreviewType(type: DiscoverFeedType): boolean {
  return type === 'for_you' || type === 'trending' || type === 'nearby'
}

export function discoverFeedRankingMode(type: DiscoverFeedType): DiscoverRankingMode {
  return type === 'trending' ? 'trending' : 'default'
}

export function discoverSeeAllRoute(type: DiscoverFeedType): { pathname: '/discover'; params: Record<string, string> } {
  switch (type) {
    case 'trending':
      return { pathname: '/discover', params: { type: 'trending' } }
    case 'nearby':
      return { pathname: '/discover', params: { type: 'nearby', location: 'cerca' } }
    case 'for_you':
      return { pathname: '/discover', params: { type: 'for_you' } }
    default:
      return { pathname: '/discover', params: {} }
  }
}

export function parseDiscoverRouteType(raw: string | string[] | undefined): DiscoverFeedType {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === 'trending' || value === 'nearby' || value === 'for_you') return value
  return 'discover'
}

/** Interleave pool-ordered places and events for personalized / trending previews. */
function buildPoolOrderPreview(
  places: EnrichedPlace[],
  events: EnrichedEvent[],
  limit: number,
): DiscoverSuggestion[] {
  const out: DiscoverSuggestion[] = []
  const maxLen = Math.max(places.length, events.length)

  for (let i = 0; i < maxLen && out.length < limit; i++) {
    if (i < places.length) out.push({ kind: 'place', data: places[i] })
    if (out.length >= limit) break
    if (i < events.length) out.push({ kind: 'event', data: events[i] })
  }

  return out
}

export function buildHomePreviewSuggestions(
  type: DiscoverFeedType,
  lugares: PlaceCardData[],
  eventos: EventCardData[],
  userCoords: Coords | null,
  limit = HOME_PREVIEW_LIMIT,
): DiscoverSuggestion[] {
  const origin = userCoords ?? SC_CENTER
  const places = enrichAllPlaces(lugares, origin)
  const events = enrichAllEvents(eventos, origin)

  switch (type) {
    case 'nearby':
      return buildCercaDeTi(places, events, limit)
    case 'trending':
    case 'for_you':
      return buildPoolOrderPreview(places, events, limit)
    default:
      return buildPoolOrderPreview(places, events, limit)
  }
}

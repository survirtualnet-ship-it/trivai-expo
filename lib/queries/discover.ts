import { supabase } from '@/lib/supabase'
import { dedupePlaces } from '@/lib/places'
import { PLACE_CARD_SELECT } from '@/lib/queries/places'
import { EVENT_CARD_SELECT } from '@/lib/queries/events'
import {
  computeEventDiscoverScore,
  computeEventPersonalizationBoost,
  computePlaceDiscoverScore,
  computePlacePersonalizationBoost,
  sortByDiscoverScore,
  trendingSinceIso,
  type DiscoverRankingMode,
} from '@/lib/discoverRanking'
import { loadDiscoverPreferences } from '@/lib/discoverPreferences'
import { fetchActivityCategoryProfile } from '@/lib/userActivity'
import type { Coords } from '@/lib/geolocation'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'

export const DISCOVER_PLACE_SELECT = `${PLACE_CARD_SELECT},created_at`
export const DISCOVER_EVENT_SELECT = `${EVENT_CARD_SELECT},created_at,is_featured`

/** Max candidates scored per feed refresh (pagination slices this sorted pool). */
export const DISCOVER_POOL_SIZE = 300

type DiscoverPlaceRow = PlaceCardData & {
  rating_count?: number | null
  created_at?: string | null
}

type DiscoverEventRow = EventCardData & {
  created_at?: string | null
  is_featured?: boolean | null
  price?: number | null
}

export interface DiscoverRankedPoolOptions {
  mode?: DiscoverRankingMode
  userId?: string | null
  userCoords?: Coords | null
}

export interface DiscoverRankedPool {
  lugares: PlaceCardData[]
  eventos: EventCardData[]
}

async function fetchRecentPlaceReviewCounts(): Promise<Map<string, number>> {
  const since = trendingSinceIso()
  const { data, error } = await supabase
    .from('reviews')
    .select('place_id')
    .gte('created_at', since)

  if (error) throw error

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const id = (row as { place_id: string }).place_id
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

async function fetchRecentEventRsvpCounts(): Promise<Map<string, number>> {
  const since = trendingSinceIso()
  const { data, error } = await supabase
    .from('event_attendees')
    .select('event_id')
    .gte('created_at', since)
    .eq('status', 'going')

  if (error) throw error

  const counts = new Map<string, number>()
  for (const row of data ?? []) {
    const id = (row as { event_id: string }).event_id
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  return counts
}

async function fetchDiscoverPlaceCandidates(): Promise<DiscoverPlaceRow[]> {
  const { data, error } = await supabase
    .from('places')
    .select(DISCOVER_PLACE_SELECT)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .limit(DISCOVER_POOL_SIZE)

  if (error) throw error
  return dedupePlaces((data ?? []) as DiscoverPlaceRow[])
}

async function fetchDiscoverEventCandidates(): Promise<DiscoverEventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select(DISCOVER_EVENT_SELECT)
    .eq('is_active', true)
    .gte('start_datetime', new Date().toISOString())
    .limit(DISCOVER_POOL_SIZE)

  if (error) throw error
  return ((data ?? []) as DiscoverEventRow[]).map(e => ({
    ...e,
    attendees_count: e.attendees_count ?? 0,
  }))
}

export async function fetchDiscoverRankedPool(
  options: DiscoverRankedPoolOptions = {},
): Promise<DiscoverRankedPool> {
  const { mode = 'default', userId = null, userCoords = null } = options

  const [lugaresRaw, eventosRaw, placeActivity, eventActivity, preferences, activityProfile] =
    await Promise.all([
      fetchDiscoverPlaceCandidates(),
      fetchDiscoverEventCandidates(),
      fetchRecentPlaceReviewCounts(),
      fetchRecentEventRsvpCounts(),
      userId ? loadDiscoverPreferences(userId) : Promise.resolve(null),
      userId ? fetchActivityCategoryProfile(userId) : Promise.resolve(null),
    ])

  const lugares = sortByDiscoverScore(lugaresRaw, place => {
    const base = computePlaceDiscoverScore(place, placeActivity.get(place.id) ?? 0, mode)
    const personal = computePlacePersonalizationBoost(
      place,
      preferences,
      userCoords,
      activityProfile,
    )
    return base + personal
  })

  const eventos = sortByDiscoverScore(eventosRaw, event => {
    const base = computeEventDiscoverScore(event, eventActivity.get(event.id) ?? 0, mode)
    const personal = computeEventPersonalizationBoost(
      event,
      preferences,
      userCoords,
      activityProfile,
    )
    return base + personal
  })

  return { lugares, eventos }
}

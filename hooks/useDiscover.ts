import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { fetchPlacesList } from '@/lib/queries/places'
import { fetchUpcomingEvents } from '@/lib/queries/events'
import { fetchSmartSearchResults } from '@/lib/smartSearch'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { discoverKeys, STALE } from '@/lib/queries/keys'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import type { SearchPerson } from '@/lib/smartSearch'

const FEED_LIMIT = 200
const SEARCH_DEBOUNCE_MS = 280

export interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

export interface DiscoverFeed {
  lugares: PlaceCardData[]
  eventos: EventCardData[]
  actividad: FriendActivity[]
  sinLeer: number
}

export { discoverKeys }

async function fetchDiscoverSocial(userId: string | null): Promise<Pick<DiscoverFeed, 'actividad' | 'sinLeer'>> {
  if (!userId) return { actividad: [], sinLeer: 0 }

  const [f1Res, f2Res, notifRes] = await Promise.all([
    supabase.from('friendships').select('friend_id').eq('user_id', userId).eq('status', 'accepted'),
    supabase.from('friendships').select('user_id').eq('friend_id', userId).eq('status', 'accepted'),
    supabase.from('notifications').select('id, type').eq('user_id', userId).eq('is_read', false),
  ])

  let sinLeer = 0
  if (notifRes.data) {
    const prefs = await loadNotifPrefs(userId)
    sinLeer = (notifRes.data as { type: string }[]).filter(n => prefAllows(prefs, n.type ?? 'system')).length
  }

  let actividad: FriendActivity[] = []
  if (f1Res.data?.length || f2Res.data?.length) {
    const friendIds = [...new Set([
      ...(f1Res.data ?? []).map((f: { friend_id: string }) => f.friend_id),
      ...(f2Res.data ?? []).map((f: { user_id: string }) => f.user_id),
    ])]
    if (friendIds.length) {
      const { data: asistencias, error: asistErr } = await supabase
        .from('event_attendees')
        .select('event:events(id,name), profile:profiles(full_name,username)')
        .in('user_id', friendIds)
        .eq('status', 'going')
        .limit(8)
      if (asistErr) throw asistErr
      if (asistencias) {
        actividad = (asistencias as any[])
          .filter(a => a.event?.id && a.profile?.full_name)
          .map((a, i) => ({
            id: `${a.event.id}-${i}`,
            quien: a.profile.full_name.split(' ')[0],
            ini: a.profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            nombre: a.event.name,
            href: `/eventos/${a.event.id}`,
          }))
      }
    }
  }

  return { actividad, sinLeer }
}

async function fetchDiscoverFeed(userId: string | null, limit: number): Promise<DiscoverFeed> {
  const [lugares, eventos, social] = await Promise.all([
    fetchPlacesList({ limit }),
    fetchUpcomingEvents({ limit }),
    fetchDiscoverSocial(userId),
  ])
  return { lugares, eventos, ...social }
}

function useDebouncedSearchQuery(searchQuery: string) {
  const trimmed = searchQuery.trim()
  const [debounced, setDebounced] = useState(trimmed)

  useEffect(() => {
    if (!trimmed) {
      setDebounced('')
      return
    }
    const timer = setTimeout(() => setDebounced(trimmed), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [trimmed])

  return { trimmed, debounced }
}

export function useDiscover(searchQuery = '') {
  const { user } = useUser()
  const userId = user?.id ?? null
  const { trimmed, debounced } = useDebouncedSearchQuery(searchQuery)

  const feedQuery = useQuery({
    queryKey: discoverKeys.feed({ userId, limit: FEED_LIMIT }),
    queryFn: () => fetchDiscoverFeed(userId, FEED_LIMIT),
    staleTime: STALE.places,
  })

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
  })

  const searchResultsQuery = useQuery({
    queryKey: discoverKeys.search({ q: debounced }),
    queryFn: () => fetchSmartSearchResults(debounced),
    enabled: debounced.length > 0,
    staleTime: STALE.places,
  })

  const searching =
    trimmed.length > 0 && (trimmed !== debounced || searchResultsQuery.isFetching)

  const refetch = async () => {
    await Promise.all([
      feedQuery.refetch(),
      coordsQuery.refetch(),
      searchResultsQuery.refetch(),
    ])
  }

  return {
    lugares: feedQuery.data?.lugares ?? [],
    eventos: feedQuery.data?.eventos ?? [],
    actividad: feedQuery.data?.actividad ?? [],
    sinLeer: feedQuery.data?.sinLeer ?? 0,
    userCoords: coordsQuery.data ?? null,
    remoteLugares: searchResultsQuery.data?.lugares ?? [],
    remoteEventos: searchResultsQuery.data?.eventos ?? [],
    personas: (searchResultsQuery.data?.personas ?? []) as SearchPerson[],
    searching,
    isSearchActive: trimmed.length > 0,
    loading: feedQuery.isLoading,
    isError: feedQuery.isError || searchResultsQuery.isError,
    error: feedQuery.error ?? searchResultsQuery.error,
    refetch,
  }
}

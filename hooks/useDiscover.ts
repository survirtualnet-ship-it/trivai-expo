import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { fetchDiscoverRankedPool } from '@/lib/queries/discover'
import { fetchSmartSearchResults } from '@/lib/smartSearch'
import { getCurrentCoords, type Coords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { dedupePlaces } from '@/lib/places'
import { discoverKeys, recommendationKeys, STALE } from '@/lib/queries/keys'
import type { DiscoverRankingMode } from '@/lib/discoverRanking'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import type { SearchPerson } from '@/lib/smartSearch'
import {
  type DiscoverFeedType,
  HOME_PREVIEW_LIMIT,
  buildHomePreviewSuggestions,
  discoverFeedRankingMode,
  isDiscoverPreviewType,
} from '@/lib/discoverFeedType'
import type { DiscoverSuggestion } from '@/lib/discoverSuggestions'
import { fetchUserRecommendationProfile } from '@/services/fetchUserRecommendationProfile'

export const DISCOVER_PAGE_SIZE = 20
export const DISCOVER_RANKING_MODE: DiscoverRankingMode = 'default'
/** Prefetch next feed page when scroll progress reaches this ratio (0–1). */
export const DISCOVER_PREFETCH_SCROLL_RATIO = 0.75
const SEARCH_DEBOUNCE_MS = 280

export interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

export interface DiscoverFeedPage {
  lugares: PlaceCardData[]
  eventos: EventCardData[]
  actividad: FriendActivity[]
  sinLeer: number
  hasMorePlaces: boolean
  hasMoreEvents: boolean
}

export type UseDiscoverMode = 'preview' | 'feed'

export interface UseDiscoverOptions {
  searchQuery?: string
  type?: DiscoverFeedType
  mode?: UseDiscoverMode
  previewLimit?: number
  enabled?: boolean
}

export { discoverKeys }

async function fetchDiscoverSocial(userId: string | null): Promise<Pick<DiscoverFeedPage, 'actividad' | 'sinLeer'>> {
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

function getDiscoverNextPageParam(
  lastPage: DiscoverFeedPage,
  _allPages: DiscoverFeedPage[],
  lastPageParam: number,
): number | undefined {
  if (!lastPage.hasMorePlaces && !lastPage.hasMoreEvents) return undefined
  return lastPageParam + 1
}

function getDiscoverFeedQueryKey(
  userId: string | null,
  rankingMode: DiscoverRankingMode,
  feedType: DiscoverFeedType,
) {
  return discoverKeys.feed({
    userId,
    pageSize: DISCOVER_PAGE_SIZE,
    rankingMode,
    feedType,
  })
}

function createDiscoverFeedQueryFn(
  userId: string | null,
  queryClient: QueryClient,
  rankingMode: DiscoverRankingMode,
) {
  return ({ pageParam }: { pageParam: number }) =>
    fetchDiscoverFeedPage(userId, pageParam, queryClient, rankingMode)
}

async function fetchDiscoverFeedPage(
  userId: string | null,
  pageParam: number,
  queryClient: QueryClient,
  rankingMode: DiscoverRankingMode = DISCOVER_RANKING_MODE,
): Promise<DiscoverFeedPage> {
  const userCoords = queryClient.getQueryData<Coords | null>(discoverKeys.coords()) ?? null

  const pool = await queryClient.fetchQuery({
    queryKey: discoverKeys.rankedPool({
      rankingMode,
      userId,
      lat: userCoords?.lat,
      lng: userCoords?.lng,
    }),
    queryFn: () => fetchDiscoverRankedPool({ mode: rankingMode, userId, userCoords }),
    staleTime: STALE.places,
  })

  const from = pageParam * DISCOVER_PAGE_SIZE
  const to = from + DISCOVER_PAGE_SIZE

  const social = pageParam === 0
    ? await fetchDiscoverSocial(userId)
    : { actividad: [] as FriendActivity[], sinLeer: 0 }

  return {
    lugares: pool.lugares.slice(from, to),
    eventos: pool.eventos.slice(from, to),
    hasMorePlaces: to < pool.lugares.length,
    hasMoreEvents: to < pool.eventos.length,
    ...social,
  }
}

function flattenDiscoverPages(pages: DiscoverFeedPage[] | undefined) {
  const allPlaces = pages?.flatMap(p => p.lugares) ?? []
  const allEvents = pages?.flatMap(p => p.eventos) ?? []

  const lugares = dedupePlaces(allPlaces)

  const seenEventIds = new Set<string>()
  const eventos = allEvents.filter(e => {
    if (seenEventIds.has(e.id)) return false
    seenEventIds.add(e.id)
    return true
  })

  return { lugares, eventos }
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

function normalizeUseDiscoverOptions(
  searchQueryOrOptions: string | UseDiscoverOptions = '',
): Required<Omit<UseDiscoverOptions, 'previewLimit'>> & { previewLimit: number } {
  const options: UseDiscoverOptions = typeof searchQueryOrOptions === 'string'
    ? { searchQuery: searchQueryOrOptions }
    : searchQueryOrOptions

  const type = options.type ?? 'discover'
  const mode = options.mode ?? (type === 'discover' ? 'feed' : 'preview')

  return {
    searchQuery: options.searchQuery ?? '',
    type,
    mode,
    previewLimit: options.previewLimit ?? HOME_PREVIEW_LIMIT,
    enabled: options.enabled ?? true,
  }
}

export function useDiscover(searchQueryOrOptions: string | UseDiscoverOptions = '') {
  const {
    searchQuery,
    type,
    mode,
    previewLimit,
    enabled,
  } = normalizeUseDiscoverOptions(searchQueryOrOptions)

  const { user } = useUser()
  const userId = user?.id ?? null
  const queryClient = useQueryClient()
  const { trimmed, debounced } = useDebouncedSearchQuery(searchQuery)
  const prefetchTargetRef = useRef<number | null>(null)

  const rankingMode = discoverFeedRankingMode(type)
  const isPreview = mode === 'preview'
  const isFeed = mode === 'feed'

  const feedQueryKey = useMemo(
    () => getDiscoverFeedQueryKey(userId, rankingMode, type),
    [userId, rankingMode, type],
  )

  useEffect(() => {
    prefetchTargetRef.current = null
  }, [feedQueryKey])

  const coordsQuery = useQuery({
    queryKey: discoverKeys.coords(),
    queryFn: getCurrentCoords,
    staleTime: STALE.coords,
    enabled,
  })

  const userCoords = coordsQuery.data ?? null

  const poolQuery = useQuery({
    queryKey: discoverKeys.rankedPool({
      rankingMode,
      userId,
      lat: userCoords?.lat,
      lng: userCoords?.lng,
    }),
    queryFn: () => fetchDiscoverRankedPool({
      mode: rankingMode,
      userId,
      userCoords,
    }),
    staleTime: STALE.places,
    enabled: enabled && isPreview && (type !== 'nearby' || coordsQuery.isFetched),
  })

  const recommendationProfileQuery = useQuery({
    queryKey: recommendationKeys.profile(userId),
    queryFn: () => fetchUserRecommendationProfile(userId),
    staleTime: STALE.user,
    enabled: enabled && isPreview && type === 'for_you',
  })

  const feedQuery = useInfiniteQuery({
    queryKey: feedQueryKey,
    queryFn: createDiscoverFeedQueryFn(userId, queryClient, rankingMode),
    initialPageParam: 0,
    getNextPageParam: getDiscoverNextPageParam,
    staleTime: STALE.places,
    enabled: enabled && isFeed,
  })

  const prefetchNextPage = useCallback(async () => {
    if (!isFeed || !feedQuery.hasNextPage || feedQuery.isFetchingNextPage) return
    if (queryClient.isFetching({ queryKey: feedQueryKey })) return

    const cached = queryClient.getQueryData<InfiniteData<DiscoverFeedPage>>(feedQueryKey)
    const loadedPages = cached?.pages.length ?? 0
    const targetPages = loadedPages + 1

    if (prefetchTargetRef.current === targetPages) return
    if (cached && cached.pages.length >= targetPages) return

    if (cached?.pages.length) {
      const lastPage = cached.pages[cached.pages.length - 1]
      const lastPageParam = cached.pageParams[cached.pageParams.length - 1] as number
      if (getDiscoverNextPageParam(lastPage, cached.pages, lastPageParam) === undefined) return
    }

    prefetchTargetRef.current = targetPages

    try {
      await queryClient.prefetchInfiniteQuery({
        queryKey: feedQueryKey,
        queryFn: createDiscoverFeedQueryFn(userId, queryClient, rankingMode),
        initialPageParam: 0,
        getNextPageParam: getDiscoverNextPageParam,
        pages: targetPages,
        staleTime: STALE.places,
      })
    } catch {
      prefetchTargetRef.current = null
    }
  }, [
    feedQuery.hasNextPage,
    feedQuery.isFetchingNextPage,
    feedQueryKey,
    isFeed,
    queryClient,
    rankingMode,
    userId,
  ])

  const prefetchFullFeed = useCallback(async () => {
    await queryClient.prefetchInfiniteQuery({
      queryKey: feedQueryKey,
      queryFn: createDiscoverFeedQueryFn(userId, queryClient, rankingMode),
      initialPageParam: 0,
      getNextPageParam: getDiscoverNextPageParam,
      pages: 1,
      staleTime: STALE.places,
    })
  }, [feedQueryKey, queryClient, rankingMode, userId])

  const searchResultsQuery = useQuery({
    queryKey: discoverKeys.search({ q: debounced }),
    queryFn: () => fetchSmartSearchResults(debounced),
    enabled: enabled && isFeed && debounced.length > 0,
    staleTime: STALE.places,
  })

  const feedItems = useMemo(
    () => flattenDiscoverPages(feedQuery.data?.pages),
    [feedQuery.data?.pages],
  )

  const previewItems = useMemo(() => {
    if (!isPreview || !poolQuery.data) {
      return { lugares: [] as PlaceCardData[], eventos: [] as EventCardData[] }
    }
    return poolQuery.data
  }, [isPreview, poolQuery.data])

  const lugares = isPreview ? previewItems.lugares : feedItems.lugares
  const eventos = isPreview ? previewItems.eventos : feedItems.eventos

  const suggestions = useMemo(() => {
    if (!isPreview || !isDiscoverPreviewType(type)) return [] as DiscoverSuggestion[]
    return buildHomePreviewSuggestions(
      type,
      lugares,
      eventos,
      userCoords,
      previewLimit,
      type === 'for_you' ? (recommendationProfileQuery.data ?? null) : null,
    )
  }, [
    isPreview,
    type,
    lugares,
    eventos,
    userCoords,
    previewLimit,
    recommendationProfileQuery.data,
  ])

  const actividad = feedQuery.data?.pages[0]?.actividad ?? []
  const sinLeer = feedQuery.data?.pages[0]?.sinLeer ?? 0

  const searching =
    isFeed && trimmed.length > 0 && (trimmed !== debounced || searchResultsQuery.isFetching)

  const refetch = async () => {
    const tasks: Promise<unknown>[] = [coordsQuery.refetch()]
    if (isFeed) tasks.push(feedQuery.refetch())
    if (isPreview) tasks.push(poolQuery.refetch())
    if (debounced.length > 0) tasks.push(searchResultsQuery.refetch())
    await Promise.all(tasks)
  }

  const loading = isPreview ? poolQuery.isLoading : feedQuery.isLoading
  const isError = isPreview
    ? poolQuery.isError
    : feedQuery.isError || searchResultsQuery.isError
  const error = isPreview
    ? poolQuery.error
    : feedQuery.error ?? searchResultsQuery.error

  return {
    lugares,
    eventos,
    suggestions,
    actividad,
    sinLeer,
    userCoords,
    remoteLugares: searchResultsQuery.data?.lugares ?? [],
    remoteEventos: searchResultsQuery.data?.eventos ?? [],
    personas: (searchResultsQuery.data?.personas ?? []) as SearchPerson[],
    searching,
    isSearchActive: isFeed && trimmed.length > 0,
    loading,
    isError,
    error,
    refetch,
    prefetchNextPage,
    prefetchFullFeed,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    type,
    mode,
  }
}


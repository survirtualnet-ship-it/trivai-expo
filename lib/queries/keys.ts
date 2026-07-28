/** Query keys centralizados para TanStack Query. */

export const placeKeys = {
  all: ['places'] as const,
  lists: () => [...placeKeys.all, 'list'] as const,
  list: (filters: { category?: string; limit?: number; search?: string } = {}) =>
    [...placeKeys.lists(), filters] as const,
  map: () => [...placeKeys.all, 'map'] as const,
  details: () => [...placeKeys.all, 'detail'] as const,
  detail: (id: string) => [...placeKeys.details(), id] as const,
  similar: (id: string) => [...placeKeys.all, 'similar', id] as const,
  reviews: (id: string) => [...placeKeys.all, 'reviews', id] as const,
  favorite: (userId: string, placeId: string) =>
    [...placeKeys.all, 'favorite', userId, placeId] as const,
}

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: { limit?: number } = {}) =>
    [...eventKeys.lists(), filters] as const,
  map: () => [...eventKeys.all, 'map'] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
}

export const userKeys = {
  all: ['user'] as const,
  session: () => [...userKeys.all, 'session'] as const,
  profile: (id: string | null) => [...userKeys.all, 'profile', id ?? 'anon'] as const,
}

export interface DiscoverFeedFilters {
  userId: string | null
  pageSize?: number
  rankingMode?: 'default' | 'trending'
  feedType?: 'discover' | 'for_you' | 'trending' | 'nearby'
}

export interface DiscoverRankedPoolFilters {
  rankingMode?: 'default' | 'trending'
  userId?: string | null
}

export interface DiscoverSearchFilters {
  q: string
}

export const discoverKeys = {
  all: ['discover'] as const,
  rankedPool: (filters: DiscoverRankedPoolFilters = {}) =>
    [...discoverKeys.all, 'ranked-pool', {
      rankingMode: filters.rankingMode ?? 'default',
      userId: filters.userId ?? 'anon',
    }] as const,
  feed: (filters: DiscoverFeedFilters) =>
    [...discoverKeys.all, 'feed', {
      userId: filters.userId ?? 'anon',
      pageSize: filters.pageSize ?? 20,
      rankingMode: filters.rankingMode ?? 'default',
      feedType: filters.feedType ?? 'discover',
    }] as const,
  search: (filters: DiscoverSearchFilters) =>
    [...discoverKeys.all, 'search', filters] as const,
  coords: () => [...discoverKeys.all, 'coords'] as const,
}

export const searchKeys = {
  all: ['search'] as const,
  results: (query: string) => [...searchKeys.all, 'results', query] as const,
  recent: () => [...searchKeys.all, 'recent'] as const,
}

export const favoriteKeys = {
  all: ['favorites'] as const,
  places: (userId: string) => [...favoriteKeys.all, 'places', userId] as const,
  /** Count-only queries — never share cache with `places` (array vs number). */
  count: (userId: string) => [...favoriteKeys.all, 'count', userId] as const,
}

export const recommendationKeys = {
  all: ['recommendation'] as const,
  profile: (userId: string | null) =>
    [...recommendationKeys.all, 'profile', userId ?? 'anon'] as const,
  places: (userId: string | null, limit: number) =>
    [...recommendationKeys.all, 'places', userId ?? 'anon', limit] as const,
}

export const STALE = {
  places: 60_000,
  events: 60_000,
  user: 30_000,
  coords: 5 * 60_000,
} as const

export const explorerKeys = {
  all: ['explorer'] as const,
  list: (filters: {
    category?: string | null
    search?: string
    userId?: string | null
  } = {}) => [...explorerKeys.all, 'list', {
    category: filters.category ?? 'all',
    search: filters.search ?? '',
    userId: filters.userId ?? 'anon',
  }] as const,
}

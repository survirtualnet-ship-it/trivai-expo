/** Query keys centralizados para TanStack Query. */

export const placeKeys = {
  all: ['places'] as const,
  lists: () => [...placeKeys.all, 'list'] as const,
  list: (filters: { category?: string; limit?: number; search?: string } = {}) =>
    [...placeKeys.lists(), filters] as const,
  map: () => [...placeKeys.all, 'map'] as const,
  details: () => [...placeKeys.all, 'detail'] as const,
  detail: (id: string) => [...placeKeys.details(), id] as const,
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
  limit?: number
}

export interface DiscoverSearchFilters {
  q: string
}

export const discoverKeys = {
  all: ['discover'] as const,
  feed: (filters: DiscoverFeedFilters) =>
    [...discoverKeys.all, { userId: filters.userId ?? 'anon', limit: filters.limit ?? 200 }] as const,
  search: (filters: DiscoverSearchFilters) =>
    [...discoverKeys.all, 'search', filters] as const,
  coords: () => [...discoverKeys.all, 'coords'] as const,
}

export const STALE = {
  places: 60_000,
  events: 60_000,
  user: 30_000,
  coords: 5 * 60_000,
} as const

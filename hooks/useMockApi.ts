/**
 * Thin React Query hooks over the mock API.
 * Use when EXPO_PUBLIC_USE_MOCK_API=1 or during local UI work.
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  fetchPlace,
  fetchPlaces,
  fetchSimilarPlaces,
  searchPlaces,
  USE_MOCK_API,
  type MockApiCategory,
} from '@/services/mockApi'
import { STALE } from '@/lib/queries/keys'

export const mockKeys = {
  all: ['mock'] as const,
  places: (filters: { category?: string; pageSize?: number } = {}) =>
    [...mockKeys.all, 'places', filters] as const,
  place: (id: string) => [...mockKeys.all, 'place', id] as const,
  similar: (id: string) => [...mockKeys.all, 'similar', id] as const,
  search: (query: string) => [...mockKeys.all, 'search', query] as const,
}

export function useMockPlaces(options?: {
  category?: MockApiCategory | string
  pageSize?: number
  enabled?: boolean
}) {
  const pageSize = options?.pageSize ?? 12
  const category = options?.category

  return useInfiniteQuery({
    queryKey: mockKeys.places({ category, pageSize }),
    queryFn: ({ pageParam }) =>
      fetchPlaces({
        page: pageParam,
        pageSize,
        category,
        asCards: true,
      }),
    initialPageParam: 1,
    getNextPageParam: last => last.nextPage,
    enabled: (options?.enabled ?? true) && USE_MOCK_API,
    staleTime: STALE.places,
  })
}

export function useMockPlace(id: string | undefined) {
  return useQuery({
    queryKey: mockKeys.place(id ?? ''),
    queryFn: () => fetchPlace(id!),
    enabled: !!id && USE_MOCK_API,
    staleTime: STALE.places,
  })
}

export function useMockSimilarPlaces(id: string | undefined) {
  return useQuery({
    queryKey: mockKeys.similar(id ?? ''),
    queryFn: () => fetchSimilarPlaces(id!, { limit: 8, asCards: true }),
    enabled: !!id && USE_MOCK_API,
    staleTime: STALE.places,
  })
}

export function useMockSearch(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: mockKeys.search(q),
    queryFn: () => searchPlaces({ query: q, asCards: true }),
    enabled: q.length > 0 && USE_MOCK_API,
    staleTime: STALE.places,
  })
}

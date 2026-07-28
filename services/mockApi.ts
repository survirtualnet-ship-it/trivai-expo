/**
 * Mock API for Trivai — full app testing without Supabase.
 *
 * React Query usage:
 *   useQuery({ queryKey: ['mock', 'places', page], queryFn: () => fetchPlaces({ page }) })
 *   useInfiniteQuery({ queryKey: ['mock', 'places'], queryFn: ({ pageParam }) => fetchPlaces({ page: pageParam }), ... })
 */

import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { Place } from '@/lib/supabase'
import {
  MOCK_API_PLACES,
  type MockApiCategory,
  type MockApiPlace,
} from '@/services/mockPlaces'

export type { MockApiPlace, MockApiCategory }
export { MOCK_API_PLACES }

// ─── Config ──────────────────────────────────────────────────────────────────

const DELAY_MIN_MS = 500
const DELAY_MAX_MS = 1000
const DEFAULT_PAGE_SIZE = 12

/** Flip to `true` (or set EXPO_PUBLIC_USE_MOCK_API=1) to force mock in production builds. */
export const USE_MOCK_API =
  process.env.EXPO_PUBLIC_USE_MOCK_API === '1' || __DEV__

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms?: number): Promise<void> {
  const wait = ms ?? DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)
  return new Promise(resolve => setTimeout(resolve, wait))
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function matchesQuery(place: MockApiPlace, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const haystack = normalize(
    [place.name, place.description, place.category, place.address, ...place.tags].join(' '),
  )
  return q.split(/\s+/).every(word => haystack.includes(word))
}

/** Map mock category → app taxonomy (lib/categories) */
export function mockCategoryToApp(category: MockApiCategory): string {
  switch (category) {
    case 'Restaurante':
    case 'Café':
      return 'Gastronomía'
    case 'Parque':
      return 'Parques'
    case 'Entretenimiento':
      return 'Entretenimiento'
    case 'Hotel':
    default:
      return 'Otros'
  }
}

export function mockApiToPlaceCard(place: MockApiPlace, distKm?: number): PlaceCardData {
  return {
    id: place.id,
    name: place.name,
    category: mockCategoryToApp(place.category),
    address: place.address,
    rating_avg: place.rating,
    rating_count: place.reviewCount,
    is_open: place.isOpen,
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
    photos: place.images,
    description: place.description,
    is_featured: place.rating >= 4.6,
    is_sponsored: place.id === 'p-007',
    _dist: distKm,
  }
}

export function mockApiToPlace(place: MockApiPlace): Place {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    category: mockCategoryToApp(place.category),
    address: place.address,
    city: 'Santa Cruz de la Sierra',
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
    phone: '+59170000000',
    website: null,
    hours: {
      lunes: '11:00 - 23:00',
      martes: '11:00 - 23:00',
      miércoles: '11:00 - 23:00',
      jueves: '11:00 - 23:00',
      viernes: '11:00 - 00:00',
      sábado: '10:00 - 00:00',
      domingo: '10:00 - 22:00',
    },
    photos: place.images,
    rating_avg: place.rating,
    rating_count: place.reviewCount,
    is_open: place.isOpen,
    is_sponsored: place.id === 'p-007',
    is_featured: place.rating >= 4.6,
    is_verified: place.rating >= 4.5,
  }
}

// ─── Pagination types (React Query friendly) ─────────────────────────────────

export interface FetchPlacesParams {
  page?: number
  pageSize?: number
  category?: MockApiCategory | string
  /** When true, returns PlaceCardData instead of MockApiPlace */
  asCards?: boolean
}

export interface PaginatedPlaces<T = MockApiPlace> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
  /** Convenience for useInfiniteQuery getNextPageParam */
  nextPage: number | undefined
}

export interface SearchPlacesParams {
  query: string
  page?: number
  pageSize?: number
  asCards?: boolean
}

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Paginated place list.
 *
 * @example
 * useInfiniteQuery({
 *   queryKey: ['mock', 'places'],
 *   queryFn: ({ pageParam = 1 }) => fetchPlaces({ page: pageParam }),
 *   getNextPageParam: last => last.nextPage,
 *   initialPageParam: 1,
 * })
 */
export async function fetchPlaces(
  params: FetchPlacesParams & { asCards: true },
): Promise<PaginatedPlaces<PlaceCardData>>
export async function fetchPlaces(
  params?: FetchPlacesParams,
): Promise<PaginatedPlaces<MockApiPlace>>
export async function fetchPlaces(
  params: FetchPlacesParams = {},
): Promise<PaginatedPlaces<MockApiPlace | PlaceCardData>> {
  await delay()

  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)

  let pool = [...MOCK_API_PLACES]

  if (params.category) {
    const cat = normalize(String(params.category))
    pool = pool.filter(p => {
      const mockCat = normalize(p.category)
      const appCat = normalize(mockCategoryToApp(p.category))
      return mockCat === cat || appCat === cat || mockCat.includes(cat)
    })
  }

  pool.sort((a, b) => b.rating - a.rating)

  const total = pool.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const slice = pool.slice(start, start + pageSize)
  const hasMore = page < totalPages

  const data = params.asCards
    ? slice.map(p => mockApiToPlaceCard(p))
    : slice

  return {
    data,
    page,
    pageSize,
    total,
    totalPages,
    hasMore,
    nextPage: hasMore ? page + 1 : undefined,
  }
}

/** Single place by id. Throws if not found (React Query error state). */
export async function fetchPlace(id: string): Promise<MockApiPlace> {
  await delay()
  const place = MOCK_API_PLACES.find(p => p.id === id)
  if (!place) {
    throw new Error(`Place not found: ${id}`)
  }
  return place
}

/** Same as fetchPlace but shaped as Supabase `Place` for detail screens. */
export async function fetchPlaceAsSupabase(id: string): Promise<Place> {
  const place = await fetchPlace(id)
  return mockApiToPlace(place)
}

/** Same as fetchPlace but shaped as PlaceCardData. */
export async function fetchPlaceAsCard(id: string): Promise<PlaceCardData> {
  const place = await fetchPlace(id)
  return mockApiToPlaceCard(place)
}

/**
 * Similar places by same category (excludes self).
 * Sorted by rating, capped by `limit`.
 */
export async function fetchSimilarPlaces(
  id: string,
  options: { limit?: number; asCards: true },
): Promise<PlaceCardData[]>
export async function fetchSimilarPlaces(
  id: string,
  options?: { limit?: number; asCards?: false },
): Promise<MockApiPlace[]>
export async function fetchSimilarPlaces(
  id: string,
  options: { limit?: number; asCards?: boolean } = {},
): Promise<MockApiPlace[] | PlaceCardData[]> {
  await delay()

  const limit = options.limit ?? 8
  const current = MOCK_API_PLACES.find(p => p.id === id)
  if (!current) return []

  const similar = MOCK_API_PLACES
    .filter(p => p.id !== id && p.category === current.category)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)

  return options.asCards ? similar.map(p => mockApiToPlaceCard(p)) : similar
}

/**
 * Full-text-ish search across name, description, category, address, tags.
 *
 * @example
 * useQuery({
 *   queryKey: ['mock', 'search', query],
 *   queryFn: () => searchPlaces({ query }),
 *   enabled: query.trim().length > 0,
 * })
 */
export async function searchPlaces(
  params: SearchPlacesParams & { asCards: true },
): Promise<PaginatedPlaces<PlaceCardData>>
export async function searchPlaces(
  params: SearchPlacesParams,
): Promise<PaginatedPlaces<MockApiPlace>>
export async function searchPlaces(
  params: SearchPlacesParams,
): Promise<PaginatedPlaces<MockApiPlace | PlaceCardData>> {
  await delay()

  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE)
  const q = params.query.trim()

  const matched = !q
    ? []
    : MOCK_API_PLACES
      .filter(p => matchesQuery(p, q))
      .sort((a, b) => b.rating - a.rating)

  const total = matched.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const start = (page - 1) * pageSize
  const slice = matched.slice(start, start + pageSize)
  const hasMore = page * pageSize < total

  const data = params.asCards
    ? slice.map(p => mockApiToPlaceCard(p))
    : slice

  return {
    data,
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : totalPages,
    hasMore,
    nextPage: hasMore ? page + 1 : undefined,
  }
}

/** All places as cards (no delay) — useful for merging into local search pools. */
export function getAllMockPlaceCards(): PlaceCardData[] {
  return MOCK_API_PLACES.map(p => mockApiToPlaceCard(p))
}

export const MOCK_API_STATS = {
  total: MOCK_API_PLACES.length,
  restaurants: MOCK_API_PLACES.filter(p => p.category === 'Restaurante').length,
  cafes: MOCK_API_PLACES.filter(p => p.category === 'Café').length,
  hotels: MOCK_API_PLACES.filter(p => p.category === 'Hotel').length,
  parks: MOCK_API_PLACES.filter(p => p.category === 'Parque').length,
  entertainment: MOCK_API_PLACES.filter(p => p.category === 'Entretenimiento').length,
} as const

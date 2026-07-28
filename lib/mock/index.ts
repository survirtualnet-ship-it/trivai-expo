export {
  MOCK_PLACES,
  MOCK_PLACE_STATS,
  mockCategoryToApp,
  mockPlacesByCategory,
  getMockPlace,
  mockToPlace,
  mockToPlaceCardData,
  mockPlaceCardList,
  mockToPlaceDetail,
  mockPriceLabel,
} from './places'

export type { MockPlace, MockPlaceCategory } from './places'

/** Prefer `services/mockApi` for new code (pagination + React Query). */
export {
  fetchPlaces,
  fetchPlace,
  fetchSimilarPlaces,
  searchPlaces,
  getAllMockPlaceCards,
  USE_MOCK_API,
  MOCK_API_STATS,
} from '@/services/mockApi'

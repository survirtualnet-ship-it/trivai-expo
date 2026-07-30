import { create } from 'zustand'
import { MOCK_MAP_PLACES, MAP_CITY_CENTER } from '../data/mockPlaces'
import { filterMapPlaces } from '../utils/filterPlaces'
import { getIndexById, normalizeMapPlace } from '../utils/placeHelpers'

export type MapPlaceType =
  | 'restaurant'
  | 'cafe'
  | 'event'
  | 'bar'
  | 'museum'
  | 'park'
  | string

export type MapPlace = {
  id: string
  name: string
  /** Canonical coords (single source of truth) */
  latitude: number
  longitude: number
  /** @deprecated use latitude — kept for existing map components */
  lat: number
  /** @deprecated use longitude */
  lng: number
  category: string
  /** Canonical image URL */
  image: string
  /** @deprecated use image */
  imageUrl: string
  type: MapPlaceType
  rating: number
  isTrending: boolean
  isRecommended: boolean
  description: string
}

export type MapFilterId = 'cerca' | 'tendencias' | 'para_ti' | 'eventos'

export type MapCoords = { lat: number; lng: number }

export type MapRegionState = {
  lat: number
  lng: number
  latDelta: number
  lngDelta: number
}

type MapStore = {
  /** Full catalog */
  places: MapPlace[]
  /** Filtered + sorted list — markers & carousel MUST use this */
  displayPlaces: MapPlace[]
  selectedPlaceId: string | null
  activeFilter: MapFilterId
  searchQuery: string
  userLocation: MapCoords | null
  region: MapRegionState
  detailOpen: boolean
  filtersVisible: boolean
  setPlaces: (places: MapPlace[]) => void
  setSelectedPlace: (id: string | null) => void
  setSelectedPlaceId: (id: string | null) => void
  getSelectedPlace: () => MapPlace | undefined
  getIndexById: (id: string) => number
  setActiveFilter: (filter: MapFilterId) => void
  setSearchQuery: (query: string) => void
  setUserLocation: (coords: MapCoords | null) => void
  setRegion: (region: MapRegionState) => void
  openDetail: () => void
  closeDetail: () => void
  dismissPreview: () => void
  toggleFilters: () => void
  recomputeDisplayPlaces: () => void
}

function buildDisplayPlaces(state: {
  places: MapPlace[]
  activeFilter: MapFilterId
  searchQuery: string
  userLocation: MapCoords | null
}): MapPlace[] {
  return filterMapPlaces(
    state.places,
    state.activeFilter,
    state.searchQuery,
    state.userLocation,
  )
}

const INITIAL_PLACES = MOCK_MAP_PLACES.map(normalizeMapPlace)

export const DEFAULT_REGION: MapRegionState = {
  lat: MAP_CITY_CENTER.lat,
  lng: MAP_CITY_CENTER.lng,
  latDelta: 0.045,
  lngDelta: 0.045,
}

export const useMapStore = create<MapStore>((set, get) => ({
  places: INITIAL_PLACES,
  displayPlaces: buildDisplayPlaces({
    places: INITIAL_PLACES,
    activeFilter: 'cerca',
    searchQuery: '',
    userLocation: null,
  }),
  selectedPlaceId: null,
  activeFilter: 'cerca',
  searchQuery: '',
  userLocation: null,
  region: DEFAULT_REGION,
  detailOpen: false,
  filtersVisible: true,

  recomputeDisplayPlaces: () => {
    const state = get()
    set({ displayPlaces: buildDisplayPlaces(state) })
  },

  setPlaces: places => {
    const normalized = places.map(normalizeMapPlace)
    set(state => ({
      places: normalized,
      displayPlaces: buildDisplayPlaces({ ...state, places: normalized }),
    }))
  },

  setSelectedPlace: id => set({ selectedPlaceId: id, detailOpen: false }),
  setSelectedPlaceId: id => set({ selectedPlaceId: id, detailOpen: false }),

  getSelectedPlace: () => {
    const { selectedPlaceId, displayPlaces, places } = get()
    if (!selectedPlaceId) return undefined
    return (
      displayPlaces.find(p => p.id === selectedPlaceId)
      ?? places.find(p => p.id === selectedPlaceId)
    )
  },

  getIndexById: id => getIndexById(get().displayPlaces, id),

  setActiveFilter: filter =>
    set(state => ({
      activeFilter: filter,
      selectedPlaceId: null,
      detailOpen: false,
      displayPlaces: buildDisplayPlaces({ ...state, activeFilter: filter }),
    })),

  setSearchQuery: query =>
    set(state => ({
      searchQuery: query,
      displayPlaces: buildDisplayPlaces({ ...state, searchQuery: query }),
    })),

  setUserLocation: coords =>
    set(state => ({
      userLocation: coords,
      displayPlaces: buildDisplayPlaces({ ...state, userLocation: coords }),
    })),

  setRegion: region => set({ region }),
  openDetail: () => set({ detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  dismissPreview: () => set({ selectedPlaceId: null, detailOpen: false }),
  toggleFilters: () => set(state => ({ filtersVisible: !state.filtersVisible })),
}))

export function selectPlaceById(id: string | null) {
  useMapStore.getState().setSelectedPlace(id)
}

export function getPlaceById(id: string | null | undefined): MapPlace | undefined {
  if (!id) return undefined
  const state = useMapStore.getState()
  return (
    state.displayPlaces.find(p => p.id === id)
    ?? state.places.find(p => p.id === id)
  )
}

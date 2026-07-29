import { create } from 'zustand'
import { MOCK_MAP_PLACES, MAP_CITY_CENTER } from '../data/mockPlaces'

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
  lat: number
  lng: number
  type: MapPlaceType
  rating: number
  isTrending: boolean
  isRecommended: boolean
  description: string
  category: string
  imageUrl: string
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
  places: MapPlace[]
  selectedPlaceId: string | null
  activeFilter: MapFilterId
  searchQuery: string
  userLocation: MapCoords | null
  region: MapRegionState
  detailOpen: boolean
  filtersVisible: boolean
  setSelectedPlaceId: (id: string | null) => void
  setActiveFilter: (filter: MapFilterId) => void
  setSearchQuery: (query: string) => void
  setUserLocation: (coords: MapCoords | null) => void
  setRegion: (region: MapRegionState) => void
  openDetail: () => void
  closeDetail: () => void
  dismissPreview: () => void
  toggleFilters: () => void
}

export const DEFAULT_REGION: MapRegionState = {
  lat: MAP_CITY_CENTER.lat,
  lng: MAP_CITY_CENTER.lng,
  latDelta: 0.045,
  lngDelta: 0.045,
}

export const useMapStore = create<MapStore>((set) => ({
  places: MOCK_MAP_PLACES,
  selectedPlaceId: null,
  activeFilter: 'cerca',
  searchQuery: '',
  userLocation: null,
  region: DEFAULT_REGION,
  detailOpen: false,
  filtersVisible: true,
  setSelectedPlaceId: id => set({ selectedPlaceId: id, detailOpen: false }),
  setActiveFilter: filter => set({ activeFilter: filter }),
  setSearchQuery: query => set({ searchQuery: query }),
  setUserLocation: coords => set({ userLocation: coords }),
  setRegion: region => set({ region }),
  openDetail: () => set({ detailOpen: true }),
  closeDetail: () => set({ detailOpen: false }),
  dismissPreview: () => set({ selectedPlaceId: null, detailOpen: false }),
  toggleFilters: () => set(state => ({ filtersVisible: !state.filtersVisible })),
}))

export function selectPlaceById(id: string | null) {
  useMapStore.getState().setSelectedPlaceId(id)
}

export function getPlaceById(id: string | null | undefined): MapPlace | undefined {
  if (!id) return undefined
  return useMapStore.getState().places.find(p => p.id === id)
}

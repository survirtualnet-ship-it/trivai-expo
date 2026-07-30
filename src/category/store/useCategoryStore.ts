import { create } from 'zustand'
import type { ZoneId } from '@/src/data/mock'
import {
  CATEGORY_PLACES,
  buildSections,
  filterPlaces,
  type CategoryId,
  type CategoryPlace,
  type CategorySections,
  type Locale,
} from '../data/mockCategoryData'

type CategoryStore = {
  selectedCategoryId: CategoryId | null
  selectedSubcategoryId: string | null
  selectedZone: ZoneId | null
  places: CategoryPlace[]
  locale: Locale
  initCategory: (id: CategoryId) => void
  setSubcategory: (id: string | null) => void
  setZone: (zone: ZoneId | null) => void
  setLocale: (locale: Locale) => void
  reset: () => void
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  selectedZone: null,
  places: CATEGORY_PLACES,
  locale: 'ES',
  initCategory: id =>
    set({
      selectedCategoryId: id,
      selectedSubcategoryId: null,
      selectedZone: null,
      places: CATEGORY_PLACES,
    }),
  setSubcategory: id => set({ selectedSubcategoryId: id }),
  setZone: zone => set({ selectedZone: zone }),
  setLocale: locale => set({ locale }),
  reset: () =>
    set({
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedZone: null,
      places: CATEGORY_PLACES,
    }),
}))

export function selectFilteredPlaces(state: CategoryStore): CategoryPlace[] {
  const { selectedCategoryId, selectedSubcategoryId, selectedZone, places } = state
  if (!selectedCategoryId) return []
  return filterPlaces(places, selectedCategoryId, selectedSubcategoryId, selectedZone)
}

export function selectSections(state: CategoryStore): CategorySections {
  return buildSections(selectFilteredPlaces(state))
}

export function selectHasResults(state: CategoryStore): boolean {
  return selectFilteredPlaces(state).length > 0
}

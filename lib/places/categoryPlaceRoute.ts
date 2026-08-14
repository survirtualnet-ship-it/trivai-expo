import { CATEGORY_PLACES } from '@/src/category/data/mockCategoryData'
import { MOCK_API_PLACES } from '@/services/mockPlaces'

const CP_ID_RE = /^cp-\d+$/
const MOCK_API_ID_RE = /^p-\d+$/

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Category browse cards use cp-NNN ids; mock API / detail screens use p-NNN or name matches. */
export function isCategoryPlaceRouteId(id: string): boolean {
  return CP_ID_RE.test(id)
}

export function isMockApiPlaceRouteId(id: string): boolean {
  return MOCK_API_ID_RE.test(id) || id.startsWith('mock-')
}

function findMockPlaceByName(name: string) {
  const target = normalizeName(name)
  const exact = MOCK_API_PLACES.find(p => normalizeName(p.name) === target)
  if (exact) return exact

  return MOCK_API_PLACES.find(p => {
    const mockName = normalizeName(p.name)
    return mockName.includes(target) || target.includes(mockName)
  })
}

/**
 * Map category card ids (cp-007) to loadable place ids (p-007).
 * Falls back to cp → p numeric swap when no name match exists.
 */
export function resolveCategoryPlaceRouteId(id: string): string {
  if (!isCategoryPlaceRouteId(id)) return id

  const categoryPlace = CATEGORY_PLACES.find(p => p.id === id)
  if (!categoryPlace) return id.replace(/^cp-/, 'p-')

  const match = findMockPlaceByName(categoryPlace.name)
  return match?.id ?? id.replace(/^cp-/, 'p-')
}

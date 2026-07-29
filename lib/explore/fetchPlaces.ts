import { EXPLORE_MOCK_PLACES } from '@/lib/explore/mockPlaces'
import type { ExploreCategoryId, ExplorePlace } from '@/lib/explore/types'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Fetch explore places (mock → swap for Supabase later). */
export async function fetchExplorePlaces(
  category: ExploreCategoryId = 'all',
  search = '',
): Promise<ExplorePlace[]> {
  await delay(280)

  const q = search.trim().toLowerCase()
  return EXPLORE_MOCK_PLACES.filter(place => {
    const catOk = category === 'all' || place.category === category
    if (!catOk) return false
    if (!q) return true
    return (
      place.name.toLowerCase().includes(q)
      || place.categoryLabel.toLowerCase().includes(q)
      || (place.address?.toLowerCase().includes(q) ?? false)
    )
  })
}

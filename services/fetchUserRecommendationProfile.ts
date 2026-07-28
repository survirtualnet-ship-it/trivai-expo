/**
 * Load recommendation UserProfile from Supabase signals.
 */

import { supabase } from '@/lib/supabase'
import { normalizeCategory } from '@/lib/categories'
import {
  coldStartUserProfile,
  emptyUserProfile,
  type UserProfile,
} from '@/services/recommendation'

const VIEW_LIMIT = 60
const FAVORITE_LIMIT = 40

/**
 * Build a UserProfile from favorites + user_activity views/saves.
 * Falls back to cold-start when the user has no signals.
 */
export async function fetchUserRecommendationProfile(
  userId: string | null | undefined,
): Promise<UserProfile> {
  if (!userId) return coldStartUserProfile()

  const [favRes, activityRes] = await Promise.all([
    supabase
      .from('favorites')
      .select('place_id, place:places(category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(FAVORITE_LIMIT),
    supabase
      .from('user_activity')
      .select('place_id, action, place:places(category)')
      .eq('user_id', userId)
      .in('action', ['view', 'save', 'like', 'share'])
      .order('created_at', { ascending: false })
      .limit(VIEW_LIMIT),
  ])

  if (favRes.error && __DEV__) {
    console.warn('[recommendation] favorites', favRes.error.message)
  }
  if (activityRes.error && __DEV__) {
    console.warn('[recommendation] activity', activityRes.error.message)
  }

  const favorites: string[] = []
  const viewedPlaces: string[] = []
  const categoryScores = new Map<string, number>()

  for (const row of favRes.data ?? []) {
    const r = row as { place_id: string; place?: { category?: string | null } | null }
    if (!r.place_id) continue
    favorites.push(r.place_id)
    const cat = normalizeCategory(r.place?.category)
    categoryScores.set(cat, (categoryScores.get(cat) ?? 0) + 3)
  }

  for (const row of activityRes.data ?? []) {
    const r = row as {
      place_id: string
      action: string
      place?: { category?: string | null } | null
    }
    if (!r.place_id) continue
    if (r.action === 'view' || r.action === 'share') viewedPlaces.push(r.place_id)
    if (r.action === 'save' || r.action === 'like') {
      if (!favorites.includes(r.place_id)) favorites.push(r.place_id)
    }
    const weight = r.action === 'save' || r.action === 'like' ? 3 : r.action === 'share' ? 2 : 1
    const cat = normalizeCategory(r.place?.category)
    categoryScores.set(cat, (categoryScores.get(cat) ?? 0) + weight)
  }

  const likedCategories = [...categoryScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat)

  if (likedCategories.length === 0 && favorites.length === 0 && viewedPlaces.length === 0) {
    return coldStartUserProfile()
  }

  return {
    likedCategories,
    viewedPlaces: [...new Set(viewedPlaces)],
    favorites: [...new Set(favorites)],
  }
}

export function isEmptyRecommendationProfile(profile: UserProfile): boolean {
  const empty = emptyUserProfile()
  return (
    profile.likedCategories.length === 0
    && profile.viewedPlaces.length === 0
    && profile.favorites.length === 0
  )
}

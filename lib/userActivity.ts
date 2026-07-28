import { supabase } from '@/lib/supabase'
import { normalizeCategory, type Category } from '@/lib/categories'

export type UserActivityAction = 'view' | 'like' | 'save' | 'share'

export interface UserActivityRow {
  user_id: string
  place_id: string
  action: UserActivityAction
  created_at?: string
}

/** Weighted category affinity derived from user_activity (null = new user / no data). */
export interface ActivityCategoryProfile {
  weights: Map<Category, number>
  topCategories: Category[]
  totalSignals: number
}

const ACTION_WEIGHT: Record<UserActivityAction, number> = {
  view: 1,
  like: 2,
  save: 3,
  share: 2,
}

const ACTIVITY_LOOKBACK_LIMIT = 80
const MIN_ACTIVITY_SIGNALS = 2

const VIEW_DEBOUNCE_MS = 30_000
const recentViews = new Map<string, number>()

function enqueuePlaceActivity(
  userId: string,
  placeId: string,
  action: UserActivityAction,
): void {
  supabase
    .from('user_activity')
    .insert({ user_id: userId, place_id: placeId, action })
    .then(({ error }) => {
      if (error && __DEV__) {
        console.warn('[userActivity]', action, error.message)
      }
    })
}

/** Fire-and-forget view log (debounced per user/place). */
export function logPlaceView(userId: string, placeId: string): void {
  if (!userId || !placeId) return
  const key = `${userId}:${placeId}`
  const now = Date.now()
  if ((recentViews.get(key) ?? 0) > now - VIEW_DEBOUNCE_MS) return
  recentViews.set(key, now)
  enqueuePlaceActivity(userId, placeId, 'view')
}

/** Fire-and-forget save/favorite log. */
export function logPlaceSave(userId: string, placeId: string): void {
  if (!userId || !placeId) return
  enqueuePlaceActivity(userId, placeId, 'save')
}

/** Fire-and-forget share log. */
export function logPlaceShare(userId: string, placeId: string): void {
  if (!userId || !placeId) return
  enqueuePlaceActivity(userId, placeId, 'share')
}

/** Fire-and-forget like log (heart / positive signal). */
export function logPlaceLike(userId: string, placeId: string): void {
  if (!userId || !placeId) return
  enqueuePlaceActivity(userId, placeId, 'like')
}

/**
 * Single lightweight query: top interacted categories from user_activity.
 * Returns null when table is empty, unavailable, or user is too new (fallback ranking).
 */
export async function fetchActivityCategoryProfile(
  userId: string,
): Promise<ActivityCategoryProfile | null> {
  const { data, error } = await supabase
    .from('user_activity')
    .select('action, place:places(category)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(ACTIVITY_LOOKBACK_LIMIT)

  if (error) {
    if (__DEV__) console.warn('[userActivity] profile', error.message)
    return null
  }
  if (!data?.length) return null

  const counts = new Map<Category, number>()
  let totalSignals = 0

  for (const row of data) {
    const place = (row as { place?: { category?: string | null } | null }).place
    const action = (row as { action?: UserActivityAction }).action
    if (!place?.category || !action) continue

    const weight = ACTION_WEIGHT[action] ?? 1
    const cat = normalizeCategory(place.category)
    counts.set(cat, (counts.get(cat) ?? 0) + weight)
    totalSignals += weight
  }

  if (totalSignals < MIN_ACTIVITY_SIGNALS || counts.size === 0) return null

  const maxCount = Math.max(...counts.values())
  const weights = new Map<Category, number>()
  for (const [cat, count] of counts) {
    weights.set(cat, count / maxCount)
  }

  const topCategories = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)

  return { weights, topCategories, totalSignals }
}

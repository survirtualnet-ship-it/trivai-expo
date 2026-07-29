import { supabase } from '@/services/supabase'

export type ActivityItem = {
  id: string
  type: 'friend_visit' | 'popular' | 'recommendation' | 'save'
  title: string
  subtitle: string
  created_at: string
  place_id?: string | null
  actor_name?: string | null
}

type ActivityRow = {
  id: string
  action?: string
  place_id?: string | null
  created_at: string
  place?: { name?: string } | null
}

/**
 * Activity feed from Supabase `user_activity`.
 * RLS should restrict rows to the authenticated user (private by default).
 */
export async function fetchActivityFeed(userId: string | null): Promise<ActivityItem[]> {
  if (!userId) return []

  const { data, error } = await supabase
    .from('user_activity')
    .select('id, action, place_id, created_at, place:places(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(40)

  if (error) {
    if (__DEV__) console.warn('[activity]', error.message)
    return []
  }

  return ((data ?? []) as ActivityRow[]).map(row => {
    const type = mapType(row.action)
    const placeName = row.place?.name ?? 'a place'
    return {
      id: row.id,
      type,
      title: titleFor(type, placeName),
      subtitle: subtitleFor(type),
      created_at: row.created_at,
      place_id: row.place_id,
      actor_name: null,
    }
  })
}

function mapType(raw?: string): ActivityItem['type'] {
  if (raw === 'view' || raw === 'visit') return 'friend_visit'
  if (raw === 'save' || raw === 'like') return 'save'
  if (raw === 'share') return 'popular'
  return 'recommendation'
}

function titleFor(type: ActivityItem['type'], placeName: string) {
  switch (type) {
    case 'friend_visit':
      return `You visited ${placeName}`
    case 'save':
      return `You saved ${placeName}`
    case 'popular':
      return `You shared ${placeName}`
    default:
      return `Recommended: ${placeName}`
  }
}

function subtitleFor(type: ActivityItem['type']) {
  switch (type) {
    case 'friend_visit':
      return 'Recent activity'
    case 'save':
      return 'In your saved list'
    case 'popular':
      return 'Shared with friends'
    default:
      return 'For you'
  }
}

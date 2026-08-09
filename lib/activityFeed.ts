import { supabase } from '@/lib/supabase'
import type {
  ActivityFriend,
  ActivityType,
  ActivityUser,
  FeedActivity,
} from '@/src/activity/store/useActivityStore'

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=640&q=80'

type PlaceJoin = {
  id: string
  name: string
  category?: string | null
  rating_avg?: number | null
  photos?: string[] | null
}

type ProfileJoin = {
  id: string
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
}

function firstPhoto(photos?: string[] | null): string {
  const uri = Array.isArray(photos) ? photos.find(p => typeof p === 'string' && p.trim()) : null
  return uri?.trim() || PLACEHOLDER_IMG
}

function profileToUser(p: ProfileJoin | null | undefined, fallbackId: string): ActivityUser {
  const name =
    p?.full_name?.trim() ||
    p?.username?.trim() ||
    'Explorador'
  return {
    id: p?.id ?? fallbackId,
    name,
    avatarUrl:
      p?.avatar_url?.trim() ||
      `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(name)}`,
  }
}

function placeFromJoin(place: PlaceJoin | null | undefined, placeId: string) {
  return {
    id: place?.id ?? placeId,
    name: place?.name?.trim() || 'Lugar',
    imageUrl: firstPhoto(place?.photos),
    category: place?.category?.trim() || 'Lugar',
    rating: Number(place?.rating_avg ?? 0),
  }
}

function mapAction(action?: string | null): ActivityType {
  if (action === 'save' || action === 'like') return 'save'
  if (action === 'share') return 'visit'
  if (action === 'view') return 'view'
  return 'view'
}

/** Accepted friend ids for the current user. */
export async function fetchAcceptedFriendIds(userId: string): Promise<string[]> {
  const [{ data: a }, { data: b }] = await Promise.all([
    supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted'),
    supabase
      .from('friendships')
      .select('user_id')
      .eq('friend_id', userId)
      .eq('status', 'accepted'),
  ])

  const ids = new Set<string>()
  for (const row of a ?? []) if (row.friend_id) ids.add(row.friend_id)
  for (const row of b ?? []) if (row.user_id) ids.add(row.user_id)
  return [...ids]
}

export async function fetchActivityFriends(userId: string): Promise<ActivityFriend[]> {
  const friendIds = await fetchAcceptedFriendIds(userId)
  if (friendIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .in('id', friendIds)

  if (error) {
    if (__DEV__) console.warn('[activityFeed] friends', error.message)
    return []
  }

  return (data ?? []).map(p => ({
    ...profileToUser(p as ProfileJoin, p.id),
    isActive: false,
  }))
}

async function fetchActivityRowsForUsers(
  userIds: string[],
  limit: number,
): Promise<FeedActivity[]> {
  if (userIds.length === 0) return []

  // user_activity.user_id → auth.users (not profiles), so join profiles separately.
  const { data, error } = await supabase
    .from('user_activity')
    .select(
      `
      id, user_id, action, place_id, created_at,
      place:places(id, name, category, rating_avg, photos)
    `,
    )
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (__DEV__) console.warn('[activityFeed] activity', error.message)
    return []
  }

  const profiles = await loadProfiles(userIds)
  return (data ?? []).map(row => {
    const r = row as {
      id: string
      user_id: string
      action?: string
      place_id: string
      created_at: string
      place?: PlaceJoin | null
    }
    return {
      id: `act-${r.id}`,
      scope: 'personal' as const,
      user: profiles.get(r.user_id) ?? profileToUser(null, r.user_id),
      type: mapAction(r.action),
      place: placeFromJoin(r.place, r.place_id),
      timestamp: new Date(r.created_at).getTime(),
      isLive: false,
    }
  })
}

async function loadProfiles(userIds: string[]): Promise<Map<string, ActivityUser>> {
  const map = new Map<string, ActivityUser>()
  if (!userIds.length) return map
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .in('id', userIds)
  for (const p of data ?? []) {
    map.set(p.id, profileToUser(p as ProfileJoin, p.id))
  }
  return map
}

async function fetchReviewActivitiesForUsers(
  userIds: string[],
  limit: number,
): Promise<FeedActivity[]> {
  if (!userIds.length) return []

  let { data, error } = await supabase
    .from('reviews')
    .select(
      `
      id, user_id, rating, created_at, place_id,
      place:places(id, name, category, rating_avg, photos)
    `,
    )
    .in('user_id', userIds)
    .or('is_hidden.is.null,is_hidden.eq.false')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Some DBs lack is_hidden — retry without that filter
  if (error) {
    const retry = await supabase
      .from('reviews')
      .select(
        `
        id, user_id, rating, created_at, place_id,
        place:places(id, name, category, rating_avg, photos)
      `,
      )
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (retry.error) {
      if (__DEV__) console.warn('[activityFeed] reviews', retry.error.message)
      return []
    }
    data = retry.data
    error = null
  }

  const profiles = await loadProfiles(userIds)
  return (data ?? []).map(row => {
    const r = row as {
      id: string
      user_id: string
      place_id: string
      created_at: string
      place?: PlaceJoin | null
    }
    return {
      id: `rev-${r.id}`,
      scope: 'personal' as const,
      user: profiles.get(r.user_id) ?? profileToUser(null, r.user_id),
      type: 'visit' as ActivityType,
      place: placeFromJoin(r.place, r.place_id),
      timestamp: new Date(r.created_at).getTime(),
      isLive: false,
    }
  })
}

function mergeSort(items: FeedActivity[]): FeedActivity[] {
  const seen = new Set<string>()
  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(item => {
      // de-dupe same user+place+type within 2 minutes
      const bucket = Math.floor(item.timestamp / 120_000)
      const key = `${item.user.id}:${item.place.id}:${item.type}:${bucket}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export async function fetchPersonalFeed(
  userId: string,
  selfProfile?: ActivityUser | null,
): Promise<FeedActivity[]> {
  const [activity, reviews] = await Promise.all([
    fetchActivityRowsForUsers([userId], 40),
    fetchReviewActivitiesForUsers([userId], 20),
  ])

  const merged = mergeSort([...activity, ...reviews]).map(item => ({
    ...item,
    scope: 'personal' as const,
    user: selfProfile ?? item.user,
  }))

  return merged.slice(0, 50)
}

export async function fetchFriendsFeed(userId: string): Promise<{
  friends: ActivityFriend[]
  activities: FeedActivity[]
}> {
  const friendIds = await fetchAcceptedFriendIds(userId)
  const friends = await fetchActivityFriends(userId)

  if (friendIds.length === 0) {
    return { friends: [], activities: [] }
  }

  const [activity, reviews] = await Promise.all([
    fetchActivityRowsForUsers(friendIds, 50),
    fetchReviewActivitiesForUsers(friendIds, 30),
  ])

  const activities = mergeSort([...activity, ...reviews])
    .map(item => ({ ...item, scope: 'friends' as const }))
    .slice(0, 60)

  // Mark friends active if they have activity in last 2h
  const cutoff = Date.now() - 2 * 60 * 60 * 1000
  const activeIds = new Set(
    activities.filter(a => a.timestamp >= cutoff).map(a => a.user.id),
  )
  const friendsWithActive = friends.map(f => ({
    ...f,
    isActive: activeIds.has(f.id),
  }))

  return { friends: friendsWithActive, activities }
}

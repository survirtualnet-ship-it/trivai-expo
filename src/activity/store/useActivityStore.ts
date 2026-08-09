import { create } from 'zustand'

export type ActivityTab = 'personal' | 'friends'
export type ActivityFilter = 'all' | 'visit' | 'save' | 'live'
export type ActivityType = 'visit' | 'save' | 'view' | 'checkin'

export type ActivityUser = {
  id: string
  name: string
  avatarUrl: string
}

export type ActivityPlace = {
  id: string
  name: string
  imageUrl: string
  category: string
  rating: number
}

export type FeedActivity = {
  id: string
  scope: ActivityTab
  user: ActivityUser
  type: ActivityType
  place: ActivityPlace
  timestamp: number
  isLive: boolean
}

export type ActivityFriend = ActivityUser & {
  isActive: boolean
}

/** UI-only store — feed data comes from React Query / Supabase. */
type ActivityUiStore = {
  selectedTab: ActivityTab
  activeFilter: ActivityFilter
  setSelectedTab: (tab: ActivityTab) => void
  setActiveFilter: (filter: ActivityFilter) => void
}

export const useActivityStore = create<ActivityUiStore>(set => ({
  selectedTab: 'personal',
  activeFilter: 'all',
  setSelectedTab: tab => set({ selectedTab: tab, activeFilter: 'all' }),
  setActiveFilter: filter => set({ activeFilter: filter }),
}))

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

export function activityActionText(
  type: ActivityType,
  userName: string,
  isSelf: boolean,
): string {
  const subject = isSelf ? 'Tú' : userName.split(' ')[0]
  switch (type) {
    case 'visit':
      return `${subject} dejó una reseña en`
    case 'save':
      return `${subject} guardó`
    case 'view':
      return `${subject} exploró`
    case 'checkin':
      return `${subject} está ahora en`
    default:
      return `${subject} interactuó con`
  }
}

export function filterActivities(
  activities: FeedActivity[],
  tab: ActivityTab,
  filter: ActivityFilter,
): FeedActivity[] {
  let list = activities.filter(a => a.scope === tab)

  switch (filter) {
    case 'visit':
      return list.filter(a => a.type === 'visit')
    case 'save':
      return list.filter(a => a.type === 'save' || a.type === 'view')
    case 'live':
      return list.filter(a => a.isLive || a.type === 'checkin')
    default:
      return list
  }
}

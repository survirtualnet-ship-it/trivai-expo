import { create } from 'zustand'
import {
  MOCK_USER,
  MOCK_FRIENDS,
  MOCK_PERSONAL_ACTIVITIES,
  MOCK_FRIENDS_ACTIVITIES,
} from '../data/mockActivities'

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

type ActivityStore = {
  user: ActivityUser
  friends: ActivityFriend[]
  activities: FeedActivity[]
  selectedTab: ActivityTab
  activeFilter: ActivityFilter
  isConnectedToFriends: boolean
  setSelectedTab: (tab: ActivityTab) => void
  setActiveFilter: (filter: ActivityFilter) => void
  connectFriends: () => void
  getActiveFriendsCount: () => number
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  user: MOCK_USER,
  friends: MOCK_FRIENDS,
  activities: [...MOCK_PERSONAL_ACTIVITIES, ...MOCK_FRIENDS_ACTIVITIES],
  selectedTab: 'personal',
  activeFilter: 'all',
  isConnectedToFriends: true,
  setSelectedTab: tab => set({ selectedTab: tab, activeFilter: 'all' }),
  setActiveFilter: filter => set({ activeFilter: filter }),
  connectFriends: () => set({ isConnectedToFriends: true }),
  getActiveFriendsCount: () => get().friends.filter(f => f.isActive).length,
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

export function activityActionText(type: ActivityType, userName: string, isSelf: boolean): string {
  const subject = isSelf ? 'Tú' : userName.split(' ')[0]
  switch (type) {
    case 'visit':
      return `${subject} visitó un lugar`
    case 'save':
      return `${subject} guardó un lugar`
    case 'view':
      return `${subject} vio un lugar`
    case 'checkin':
      return `${subject} está ahora en`
    default:
      return `${subject} interactuó con un lugar`
  }
}

export function filterActivities(
  activities: FeedActivity[],
  tab: ActivityTab,
  filter: ActivityFilter,
  userId: string,
): FeedActivity[] {
  let list = activities.filter(a => a.scope === tab)

  if (tab === 'personal') {
    list = list.map(a => ({
      ...a,
      user: { ...a.user, name: a.user.id === userId ? 'Tú' : a.user.name },
    }))
  }

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

import { create } from 'zustand'
import {
  MOCK_USER,
  MOCK_PREFERENCES,
  MOCK_CURRENT_STATUS,
  MOCK_RECOMMENDATIONS,
  MOCK_AUTO_PLANS,
  MOCK_ACTIVITY,
  MOCK_FAVORITE_LISTS,
  MOCK_ACHIEVEMENTS,
  MOCK_SETTINGS,
} from '../data/mockProfile'

export type TravelerType = 'Foodie' | 'Cultural' | 'Nightlife' | 'Explorer'

export type ProfileUser = {
  id: string
  name: string
  avatarUrl: string
  initials: string
  city: string
  travelerType: TravelerType
}

export type ProfilePreferences = {
  smartTags: string[]
  budgetLevel: 1 | 2 | 3
  preferredTime: 'morning' | 'afternoon' | 'night'
  favoriteCategories: string[]
}

export type CurrentStatus = {
  zone: string
  suggestion: string
  moodEmoji: string
}

export type ProfileRecommendation = {
  id: string
  name: string
  category: string
  rating: number
  imageUrl: string
  highlight?: boolean
}

export type AutoPlan = {
  id: string
  title: string
  subtitle: string
  emoji: string
  generating?: boolean
}

export type ActivityRecord = {
  id: string
  placeName: string
  imageUrl: string
  date: string
  type: 'visitado' | 'guardado'
}

export type FavoriteList = {
  id: string
  title: string
  count: number
  coverUrl: string
}

export type Achievement = {
  id: string
  title: string
  icon: string
  progress: number
  total: number
  unlocked: boolean
}

export type ProfileSettings = {
  language: string
  currency: string
  notifications: boolean
  privacy: boolean
}

type ProfileStore = {
  user: ProfileUser
  preferences: ProfilePreferences
  currentStatus: CurrentStatus
  recommendations: ProfileRecommendation[]
  autoPlans: AutoPlan[]
  activity: ActivityRecord[]
  favoriteLists: FavoriteList[]
  achievements: Achievement[]
  settings: ProfileSettings
  isLoading: boolean
  setLoading: (loading: boolean) => void
  generatePlan: (planId: string) => void
  toggleNotifications: () => void
  togglePrivacy: () => void
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  user: MOCK_USER,
  preferences: MOCK_PREFERENCES,
  currentStatus: MOCK_CURRENT_STATUS,
  recommendations: MOCK_RECOMMENDATIONS,
  autoPlans: MOCK_AUTO_PLANS,
  activity: MOCK_ACTIVITY,
  favoriteLists: MOCK_FAVORITE_LISTS,
  achievements: MOCK_ACHIEVEMENTS,
  settings: MOCK_SETTINGS,
  isLoading: false,
  setLoading: loading => set({ isLoading: loading }),
  generatePlan: planId => {
    set(state => ({
      autoPlans: state.autoPlans.map(p =>
        p.id === planId ? { ...p, generating: true } : p,
      ),
    }))
    setTimeout(() => {
      set(state => ({
        autoPlans: state.autoPlans.map(p =>
          p.id === planId ? { ...p, generating: false } : p,
        ),
      }))
    }, 1800)
  },
  toggleNotifications: () => {
    const { settings } = get()
    set({ settings: { ...settings, notifications: !settings.notifications } })
  },
  togglePrivacy: () => {
    const { settings } = get()
    set({ settings: { ...settings, privacy: !settings.privacy } })
  },
}))

export function budgetLabel(level: 1 | 2 | 3): string {
  if (level === 1) return '€'
  if (level === 2) return '€€'
  return '€€€'
}

export function preferredTimeLabel(time: ProfilePreferences['preferredTime']): string {
  switch (time) {
    case 'morning':
      return 'Mañanas'
    case 'afternoon':
      return 'Tardes'
    default:
      return 'Noches'
  }
}

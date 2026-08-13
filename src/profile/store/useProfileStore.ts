import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEFAULT_SETTINGS, EMPTY_USER } from '../data/mockProfile'
import type { UserRole } from '@/lib/domain/user'
import { normalizeUserRole } from '@/lib/domain/user'

export type { UserRole }
export type TravelerType = 'Foodie' | 'Cultural' | 'Nightlife' | 'Explorer'

export type ProfileUser = {
  id: string
  name: string
  email?: string
  /** Alias visual — same as avatarUrl when synced from auth */
  photo?: string
  avatarUrl: string
  initials: string
  city: string
  travelerType: TravelerType
  role: UserRole
  /** @deprecated Use activeBusinessId */
  companyId?: string
  activeBusinessId?: string
  businessIds?: string[]
  onboardingCompleted: boolean
  locationPermission?: boolean
}

export type ProfileSettings = {
  language: string
  currency: string
  notifications: boolean
  privacy: boolean
}

/** Card shape for “Para ti hoy” — filled from real place ranking. */
export type ProfileRecommendation = {
  id: string
  name: string
  category: string
  rating: number
  imageUrl: string
  highlight?: boolean
}

type ProfileStore = {
  user: ProfileUser
  settings: ProfileSettings
  setUser: (patch: Partial<ProfileUser>) => void
  completeOnboarding: (patch?: Partial<ProfileUser>) => void
  resetUser: () => void
  toggleNotifications: () => void
  togglePrivacy: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      user: EMPTY_USER,
      settings: DEFAULT_SETTINGS,
      setUser: patch =>
        set(state => ({
          user: {
            ...state.user,
            ...patch,
            role: patch.role
              ? normalizeUserRole(patch.role) ?? state.user.role
              : state.user.role,
          },
        })),
      completeOnboarding: patch =>
        set(state => ({
          user: {
            ...state.user,
            ...patch,
            onboardingCompleted: true,
          },
        })),
      resetUser: () =>
        set({
          user: { ...EMPTY_USER },
        }),
      toggleNotifications: () => {
        const { settings } = get()
        set({ settings: { ...settings, notifications: !settings.notifications } })
      },
      togglePrivacy: () => {
        const { settings } = get()
        set({ settings: { ...settings, privacy: !settings.privacy } })
      },
    }),
    {
      // v2: drop mock list seeds / celebrity default identity from older clients
      name: 'trivai-profile-user-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          photo: state.user.photo,
          avatarUrl: state.user.avatarUrl,
          initials: state.user.initials,
          city: state.user.city,
          travelerType: state.user.travelerType,
          role: state.user.role,
          companyId: state.user.activeBusinessId ?? state.user.companyId,
          activeBusinessId: state.user.activeBusinessId ?? state.user.companyId,
          businessIds: state.user.businessIds ?? [],
          onboardingCompleted: state.user.onboardingCompleted,
          locationPermission: state.user.locationPermission,
        },
        settings: state.settings,
      }),
    },
  ),
)

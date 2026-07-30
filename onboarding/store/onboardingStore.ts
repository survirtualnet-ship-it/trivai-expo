import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GoogleAuthUser } from '../lib/googleAuth'

export type UserType = 'tourist' | 'business'

export type OnboardingLocation = {
  lat: number
  lng: number
  label?: string
}

export type BusinessData = {
  name: string
  address: string
  placeId: string
  lat: number
  lng: number
  category?: string
  description?: string
  phone?: string
  website?: string
  whatsapp?: string
  openingHours?: string
  verificationStatus?: 'approved' | 'pending'
}

type OnboardingStore = {
  userType: UserType | null
  interests: string[]
  location: OnboardingLocation | null
  googleUser: GoogleAuthUser | null
  businessData: BusinessData | null
  onboardingCompleted: boolean
  setUserType: (type: UserType) => void
  setInterests: (interests: string[]) => void
  toggleInterest: (id: string) => void
  setLocation: (location: OnboardingLocation | null) => void
  setGoogleUser: (user: GoogleAuthUser | null) => void
  setBusinessData: (data: BusinessData | null) => void
  updateBusinessData: (patch: Partial<BusinessData>) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

const initialState = {
  userType: null as UserType | null,
  interests: [] as string[],
  location: null as OnboardingLocation | null,
  googleUser: null as GoogleAuthUser | null,
  businessData: null as BusinessData | null,
  onboardingCompleted: false,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setUserType: userType => set({ userType }),
      setInterests: interests => set({ interests }),
      toggleInterest: id => {
        const current = get().interests
        set({
          interests: current.includes(id)
            ? current.filter(i => i !== id)
            : [...current, id],
        })
      },
      setLocation: location => set({ location }),
      setGoogleUser: googleUser => set({ googleUser }),
      setBusinessData: businessData => set({ businessData }),
      updateBusinessData: patch => {
        const prev = get().businessData
        if (!prev) return
        set({ businessData: { ...prev, ...patch } })
      },
      completeOnboarding: () => set({ onboardingCompleted: true }),
      resetOnboarding: () => set({ ...initialState }),
    }),
    {
      name: 'trivai-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        userType: state.userType,
        interests: state.interests,
        location: state.location,
        googleUser: state.googleUser,
        businessData: state.businessData,
        onboardingCompleted: state.onboardingCompleted,
      }),
    },
  ),
)

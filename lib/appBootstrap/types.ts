import type { Href } from 'expo-router'

export type UserRole = 'tourist' | 'company'

export type BootstrapPhase =
  | 'loading'
  | 'welcome'
  | 'onboarding'
  | 'tourist-home'
  | 'company-dashboard'
  | 'company-onboarding'

export type BootstrapState = {
  ready: boolean
  checkingSession: boolean
  loadingUser: boolean
  storesHydrated: boolean
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  role: UserRole | null
  companyId: string | null
  phase: BootstrapPhase
  destination: Href
}

import type { Href } from 'expo-router'
import type { UserRole as DomainUserRole } from '@/lib/domain/user'

/** Authenticated user roles. Anonymous guests have role = null. */
export type UserRole = DomainUserRole

export type BootstrapPhase =
  | 'loading'
  | 'welcome'
  | 'legal-accept'
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
  needsLegalAcceptance: boolean
  role: UserRole | null
  /** @deprecated Use activeBusinessId — primary owned business UUID. */
  companyId: string | null
  activeBusinessId: string | null
  ownedBusinessIds: string[]
  phase: BootstrapPhase
  destination: Href
}

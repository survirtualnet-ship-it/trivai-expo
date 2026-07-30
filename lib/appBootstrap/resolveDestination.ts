import type { Href } from 'expo-router'
import type { BootstrapPhase, UserRole } from './types'

export type DestinationInput = {
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  role: UserRole | null
  companyId: string | null
}

/** Pure routing — single source of truth for post-bootstrap navigation. */
export function resolveAppDestination(input: DestinationInput): {
  phase: BootstrapPhase
  destination: Href
} {
  const { isAuthenticated, hasCompletedOnboarding, role, companyId } = input

  if (!isAuthenticated) {
    return { phase: 'welcome', destination: '/welcome' }
  }

  if (!hasCompletedOnboarding) {
    return { phase: 'onboarding', destination: '/onboarding' }
  }

  if (role === 'company') {
    if (companyId) {
      return {
        phase: 'company-dashboard',
        destination: `/empresa/${companyId}`,
      }
    }
    return {
      phase: 'company-onboarding',
      destination: '/empresa/onboarding',
    }
  }

  return { phase: 'tourist-home', destination: '/(tabs)/' }
}

/** After login/register/callback — same rules, skips welcome. */
export function resolvePostAuthDestination(input: DestinationInput): Href {
  return resolveAppDestination(input).destination
}

export function destinationMatchesPath(destination: Href, pathname: string): boolean {
  const dest = String(destination).replace(/\/$/, '') || '/'
  const path = pathname.replace(/\/$/, '') || '/'

  if (dest === path) return true
  if (dest === '/(tabs)' && (path === '' || path === '/')) return true
  if (dest === '/(tabs)/' && (path === '' || path === '/')) return true
  if (dest.startsWith('/(tabs)') && (path === '' || path === '/')) return true
  if (dest.startsWith('/empresa/') && path.startsWith('/empresa/')) {
    return dest === path
  }
  return false
}

export function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/welcome' ||
    pathname.startsWith('/auth')
  )
}

export function isOnboardingPath(pathname: string): boolean {
  return (
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    pathname === '/empresa/onboarding'
  )
}

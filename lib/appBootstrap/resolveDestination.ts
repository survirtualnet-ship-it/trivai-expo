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

export function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/'
}

export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path === '/welcome' || path.startsWith('/auth')
}

/** Auth forms stay accessible even with a stale persisted session. */
export function isAuthFormPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return (
    path === '/auth/login' ||
    path === '/auth/registro' ||
    path === '/auth/reset-password'
  )
}

export function isOnboardingPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return (
    path === '/onboarding' ||
    path.startsWith('/onboarding/') ||
    path === '/empresa/onboarding'
  )
}

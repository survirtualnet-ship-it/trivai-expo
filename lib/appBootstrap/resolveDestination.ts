import type { Href } from 'expo-router'
import type { BootstrapPhase, UserRole } from './types'
import { isAuthCallbackPath } from '@/lib/auth/completeAuthCallback'
import { isBusinessUser } from '@/lib/domain/user'

export type DestinationInput = {
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  needsLegalAcceptance?: boolean
  role: UserRole | null
  /** @deprecated Use activeBusinessId */
  companyId: string | null
  activeBusinessId?: string | null
}

/** Pure routing — single source of truth for post-bootstrap navigation. */
export function resolveAppDestination(input: DestinationInput): {
  phase: BootstrapPhase
  destination: Href
} {
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    needsLegalAcceptance = false,
    role,
    companyId,
  } = input

  const activeBusinessId = input.activeBusinessId ?? companyId

  if (!isAuthenticated) {
    return { phase: 'welcome', destination: '/welcome' }
  }

  if (needsLegalAcceptance) {
    return { phase: 'legal-accept', destination: '/legal/accept' }
  }

  if (!hasCompletedOnboarding) {
    return { phase: 'onboarding', destination: '/onboarding' }
  }

  // Business users (Empresa) enter main tabs like tourists; Mi Negocio is an extra tab.
  if (isBusinessUser(role) && !activeBusinessId) {
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

/** Legal docs are readable by anyone; /legal/accept is for logged-in re-consent. */
export function isLegalPath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path === '/legal' || path.startsWith('/legal/')
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
    path === '/empresa/onboarding' ||
    path.startsWith('/empresa/onboarding/') ||
    path === '/empresa/plan'
  )
}

/** Guest exploration — no login required (read-only browse). */
export function isPublicBrowsePath(pathname: string): boolean {
  const path = normalizePath(pathname)

  if (isPublicPath(path)) return true
  if (isAuthCallbackPath(path)) return true
  if (isLegalPath(path)) return true

  if (path.startsWith('/place/') || path.startsWith('/lugares/')) return true
  if (path.startsWith('/eventos/')) return true
  if (path.startsWith('/categoria/')) return true
  if (path.startsWith('/buscar')) return true
  if (path.startsWith('/explorer')) return true
  if (path.startsWith('/perfil/') && path !== '/perfil') return true

  const browseTabs = new Set([
    '/',
    '/discover',
    '/mapa',
    '/eventos',
    '/lugares',
    '/explore',
    '/activity',
    '/profile',
    '/perfil',
    '/mi-negocio',
  ])
  if (browseTabs.has(path)) return true

  return false
}

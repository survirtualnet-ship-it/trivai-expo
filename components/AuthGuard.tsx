import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import {
  destinationMatchesPath,
  isAuthFormPath,
  isLegalPath,
  isOnboardingPath,
  isPublicBrowsePath,
  isPublicPath,
  normalizePath,
} from '@/lib/appBootstrap'
import { isAuthCallbackPath } from '@/lib/auth/completeAuthCallback'

/**
 * Global route protection — redirects unauthenticated users to welcome/login
 * and enforces legal consent, onboarding + role-based destinations.
 */
export function AuthGuard() {
  const bootstrap = useAppBootstrap()
  const authLoading = useAuthStore(s => s.isLoading)
  const pathname = usePathname()
  const router = useRouter()
  const lastRedirect = useRef<string | null>(null)

  useEffect(() => {
    if (!bootstrap.ready || authLoading) return

    const path = normalizePath(pathname || '/')

    // Let /auth/callback finish OAuth + navigateAfterAuth without being yanked away
    if (isAuthCallbackPath(path)) return

    // Legal docs always readable; accept screen is the re-consent gate
    if (isLegalPath(path)) {
      if (
        path === '/legal/accept' &&
        !bootstrap.isAuthenticated
      ) {
        if (lastRedirect.current !== '/welcome') {
          lastRedirect.current = '/welcome'
          router.replace('/welcome')
        }
        return
      }
      if (
        bootstrap.isAuthenticated &&
        bootstrap.needsLegalAcceptance &&
        path !== '/legal/accept' &&
        !path.startsWith('/legal/terms') &&
        !path.startsWith('/legal/privacy') &&
        !path.startsWith('/legal/content-policy')
      ) {
        if (lastRedirect.current !== '/legal/accept') {
          lastRedirect.current = '/legal/accept'
          router.replace('/legal/accept')
        }
      }
      return
    }

    // Logged-in users must accept current legal version before anything else
    if (bootstrap.isAuthenticated && bootstrap.needsLegalAcceptance) {
      if (isAuthFormPath(path)) return
      if (lastRedirect.current !== '/legal/accept') {
        lastRedirect.current = '/legal/accept'
        router.replace('/legal/accept')
      }
      return
    }

    // Guests can browse places, map, discover — read-only exploration
    if (isPublicBrowsePath(path) && !isPublicPath(path)) {
      return
    }

    if (isPublicPath(path)) {
      // Keep login/register reachable (stale persisted session must not yank the form away)
      if (isAuthFormPath(path)) return

      if (bootstrap.isAuthenticated && !bootstrap.hasCompletedOnboarding) {
        if (lastRedirect.current !== '/onboarding') {
          lastRedirect.current = '/onboarding'
          router.replace('/onboarding')
        }
        return
      }
      if (bootstrap.isAuthenticated && bootstrap.hasCompletedOnboarding) {
        const dest = String(bootstrap.destination)
        if (!destinationMatchesPath(bootstrap.destination, path) && lastRedirect.current !== dest) {
          lastRedirect.current = dest
          router.replace(bootstrap.destination)
        }
      }
      return
    }

    if (isOnboardingPath(path)) {
      if (!bootstrap.isAuthenticated) {
        if (lastRedirect.current !== '/welcome') {
          lastRedirect.current = '/welcome'
          router.replace('/welcome')
        }
        return
      }
      if (bootstrap.hasCompletedOnboarding) {
        const dest = String(bootstrap.destination)
        if (lastRedirect.current !== dest) {
          lastRedirect.current = dest
          router.replace(bootstrap.destination)
        }
      }
      return
    }

    if (!bootstrap.isAuthenticated) {
      const dest = '/welcome'
      if (lastRedirect.current !== dest) {
        lastRedirect.current = dest
        router.replace(dest)
      }
      return
    }

    if (!bootstrap.hasCompletedOnboarding) {
      if (lastRedirect.current !== '/onboarding') {
        lastRedirect.current = '/onboarding'
        router.replace('/onboarding')
      }
      return
    }

    if (
      bootstrap.role === 'company' &&
      bootstrap.companyId &&
      (path === '/' || path.startsWith('/activity') || path.startsWith('/mapa') || path.startsWith('/profile'))
    ) {
      const dest = `/empresa/${bootstrap.companyId}`
      if (path !== dest && lastRedirect.current !== dest) {
        lastRedirect.current = dest
        router.replace(dest as `/empresa/${string}`)
      }
      return
    }

    if (
      bootstrap.role === 'tourist' &&
      path === '/empresa/onboarding'
    ) {
      if (lastRedirect.current !== '/(tabs)/') {
        lastRedirect.current = '/(tabs)/'
        router.replace('/(tabs)/')
      }
    }
  }, [bootstrap, authLoading, pathname, router])

  return null
}

/** @deprecated Use AuthGuard — kept for existing imports */
export const NavigationGuard = AuthGuard

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
import { isBusinessUser, assertNotMobileAdmin } from '@/lib/domain'

/**
 * Global route protection.
 * Anonymous guests: no User, no role — read-only browse via isPublicBrowsePath.
 * Authenticated: tourist | business | admin (admin → BackOffice only).
 */
export function AuthGuard() {
  const bootstrap = useAppBootstrap()
  const authLoading = useAuthStore(s => s.isLoading)
  const pathname = usePathname()
  const router = useRouter()
  const lastRedirect = useRef<string | null>(null)

  useEffect(() => {
    if (!bootstrap.ready || authLoading) return

    assertNotMobileAdmin(bootstrap.role)

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

    // Business users (Empresa) share Inicio/Mapa/Actividad/Perfil + tab Mi Negocio.
    // AppMode toggles explore vs business UI — never force /empresa/{id} on launch.

    const activeBusinessId = bootstrap.activeBusinessId ?? bootstrap.companyId

    // Non-business users must not stay on owner panel URLs from stale history.
    if (
      bootstrap.isAuthenticated &&
      bootstrap.hasCompletedOnboarding &&
      !bootstrap.needsLegalAcceptance &&
      path.startsWith('/empresa/') &&
      !path.startsWith('/empresa/onboarding') &&
      path !== '/empresa/plan' &&
      path !== '/empresa/suscripcion' &&
      path !== '/empresa/mi-negocio' &&
      !isBusinessUser(bootstrap.role) &&
      !activeBusinessId
    ) {
      const dest = '/(tabs)/'
      if (lastRedirect.current !== dest) {
        lastRedirect.current = dest
        router.replace(dest)
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
      // Allow /empresa/onboarding/* and /empresa/plan for already-onboarded users claiming a business
      if (
        bootstrap.hasCompletedOnboarding
        && !(path === '/empresa/onboarding' || path.startsWith('/empresa/onboarding/') || path === '/empresa/plan' || path === '/empresa/suscripcion')
      ) {
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
      bootstrap.role === 'tourist' &&
      (path === '/empresa/onboarding' ||
        path.startsWith('/empresa/onboarding/') ||
        path === '/empresa/plan' ||
        path === '/empresa/suscripcion')
    ) {
      // Tourists may start claim flow → becomes business user after claim + plan.
      return
    }
  }, [bootstrap, authLoading, pathname, router])

  return null
}

/** @deprecated Use AuthGuard — kept for existing imports */
export const NavigationGuard = AuthGuard

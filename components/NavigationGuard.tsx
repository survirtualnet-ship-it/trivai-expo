import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import {
  destinationMatchesPath,
  isOnboardingPath,
  isPublicPath,
} from '@/lib/appBootstrap'

/**
 * Route guard — redirects based on auth + onboarding + role.
 * Prevents flicker loops with a ref lock.
 */
export function NavigationGuard() {
  const bootstrap = useAppBootstrap()
  const pathname = usePathname()
  const router = useRouter()
  const lastRedirect = useRef<string | null>(null)

  useEffect(() => {
    if (!bootstrap.ready) return

    const path = pathname || '/'

    // Public routes: welcome + auth
    if (isPublicPath(path)) {
      if (bootstrap.isAuthenticated && bootstrap.hasCompletedOnboarding) {
        const dest = String(bootstrap.destination)
        if (!destinationMatchesPath(bootstrap.destination, path) && lastRedirect.current !== dest) {
          lastRedirect.current = dest
          router.replace(bootstrap.destination)
        }
      }
      return
    }

    // Onboarding routes — require auth, block if already done
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

    // All other routes — require auth
    if (!bootstrap.isAuthenticated) {
      const dest = '/welcome'
      if (lastRedirect.current !== dest) {
        lastRedirect.current = dest
        router.replace(dest)
      }
      return
    }

    // Require onboarding before app modules
    if (!bootstrap.hasCompletedOnboarding) {
      if (lastRedirect.current !== '/onboarding') {
        lastRedirect.current = '/onboarding'
        router.replace('/onboarding')
      }
      return
    }

    // Company users should not stay on tourist tabs as home
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

    // Tourist users should not access company owner onboarding if already tourist
    if (
      bootstrap.role === 'tourist' &&
      path === '/empresa/onboarding'
    ) {
      if (lastRedirect.current !== '/(tabs)/') {
        lastRedirect.current = '/(tabs)/'
        router.replace('/(tabs)/')
      }
    }
  }, [bootstrap, pathname, router])

  return null
}

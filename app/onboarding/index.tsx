import { useEffect } from 'react'
import { router } from 'expo-router'
import { OnboardingRoot } from '@/onboarding/OnboardingRoot'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { SplashScreen } from '@/components/SplashScreen'

/**
 * Post-auth onboarding — role selection + tourist/business flows.
 * Skips Welcome (user already authenticated).
 */
export default function OnboardingRoute() {
  const bootstrap = useAppBootstrap()

  useEffect(() => {
    if (!bootstrap.ready) return
    if (!bootstrap.isAuthenticated) {
      router.replace('/welcome')
      return
    }
    if (bootstrap.hasCompletedOnboarding) {
      router.replace(bootstrap.destination)
    }
  }, [bootstrap])

  if (!bootstrap.ready) {
    return <SplashScreen message="Cargando onboarding…" />
  }

  if (!bootstrap.isAuthenticated || bootstrap.hasCompletedOnboarding) {
    return <SplashScreen />
  }

  return <OnboardingRoot initialRouteName="UserType" />
}

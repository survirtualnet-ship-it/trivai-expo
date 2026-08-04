import { Redirect } from 'expo-router'
import { OnboardingRoot } from '@/onboarding/OnboardingRoot'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { SplashScreen } from '@/components/SplashScreen'

/**
 * Post-auth onboarding — role selection + tourist/business flows.
 */
export default function OnboardingRoute() {
  const bootstrap = useAppBootstrap()

  if (!bootstrap.ready) {
    return <SplashScreen message="Cargando onboarding…" />
  }

  if (!bootstrap.isAuthenticated) {
    return <Redirect href="/welcome" />
  }

  if (bootstrap.hasCompletedOnboarding) {
    return <Redirect href={bootstrap.destination} />
  }

  return <OnboardingRoot initialRouteName="UserType" />
}

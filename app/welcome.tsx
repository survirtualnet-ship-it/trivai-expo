import { useEffect } from 'react'
import { router } from 'expo-router'
import { WelcomeScreen } from '@/onboarding/screens/WelcomeScreen'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { SplashScreen } from '@/components/SplashScreen'

/**
 * Pre-auth welcome — Splash → Welcome → /auth
 * Authenticated users with onboarding done are redirected by NavigationGuard.
 */
export default function WelcomeRoute() {
  const bootstrap = useAppBootstrap()

  useEffect(() => {
    if (!bootstrap.ready) return
    if (bootstrap.isAuthenticated && !bootstrap.hasCompletedOnboarding) {
      router.replace('/onboarding')
    }
  }, [bootstrap])

  if (!bootstrap.ready) {
    return <SplashScreen message="Preparando tu experiencia…" />
  }

  return (
    <WelcomeScreen
      onContinue={() => router.push('/auth')}
      onLogin={() => router.push('/auth/login')}
    />
  )
}

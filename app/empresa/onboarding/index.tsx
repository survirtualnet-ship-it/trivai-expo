import { useEffect } from 'react'
import { Redirect, router } from 'expo-router'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useUser } from '@/hooks/useUser'
import { SplashScreen } from '@/components/SplashScreen'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useAppModeStore } from '@/src/appMode'

/**
 * Entry for "Registrar mi negocio".
 * Already signed-in users skip Google login and go straight to search.
 * Users who already claimed a business return to the main app (not a silo).
 */
export default function BusinessOnboardingIndex() {
  const bootstrap = useAppBootstrap()
  const { user, profile } = useUser()
  const setGoogleUser = useOnboardingStore(s => s.setGoogleUser)
  const companyId =
    profile?.business_place_id
    ?? bootstrap.companyId
    ?? null

  useEffect(() => {
    if (!bootstrap.ready || !bootstrap.isAuthenticated) return
    if (companyId) {
      useAppModeStore.getState().setMode('business')
      router.replace(`/(tabs)/`)
      return
    }

    if (user) {
      setGoogleUser({
        id: user.id,
        name: profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
        email: user.email ?? '',
        picture: profile?.avatar_url ?? undefined,
      })
      router.replace('/empresa/onboarding/search')
      return
    }

    router.replace('/empresa/onboarding/login')
  }, [bootstrap, companyId, user, profile, setGoogleUser])

  if (!bootstrap.ready) {
    return <SplashScreen message="Cargando…" />
  }

  if (!bootstrap.isAuthenticated) {
    return <Redirect href="/welcome" />
  }

  return <SplashScreen message="Abriendo registro de negocio…" />
}

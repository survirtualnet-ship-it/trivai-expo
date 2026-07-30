import { useEffect } from 'react'
import { BusinessOnboardingRoot } from '@/onboarding/BusinessOnboardingRoot'
import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { SplashScreen } from '@/components/SplashScreen'

export default function CompanyOnboardingRoute() {
  const companyId = useProfileStore(s => s.user.companyId)
  const bootstrap = useAppBootstrap()

  useEffect(() => {
    if (!bootstrap.ready) return
    if (!bootstrap.isAuthenticated) {
      router.replace('/welcome')
      return
    }
    if (companyId) {
      router.replace(`/empresa/${companyId}`)
    }
  }, [bootstrap, companyId])

  if (!bootstrap.ready || !bootstrap.isAuthenticated) {
    return <SplashScreen />
  }

  if (companyId) return null

  return <BusinessOnboardingRoot />
}

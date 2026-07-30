import { useEffect } from 'react'
import { BusinessOnboardingRoot } from '@/onboarding/BusinessOnboardingRoot'
import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'

export default function CompanyOnboardingRoute() {
  const companyId = useProfileStore(s => s.user.companyId)

  useEffect(() => {
    if (companyId) {
      router.replace(`/empresa/${companyId}`)
    }
  }, [companyId])

  if (companyId) return null

  return <BusinessOnboardingRoot />
}

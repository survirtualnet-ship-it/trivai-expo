import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'

/** Profile → My Business (protected hub) or claim flow */
export function navigateToMyBusiness() {
  const companyId = useProfileStore.getState().user.companyId
  if (companyId) {
    router.push(`/empresa/${companyId}`)
    return
  }
  router.push('/empresa/mi-negocio')
}

/** Redirect to onboarding when no company is linked */
export function redirectToCompanyOnboarding() {
  router.replace('/empresa/onboarding')
}

export function requireCompanyId(): string | null {
  return useProfileStore.getState().user.companyId ?? null
}

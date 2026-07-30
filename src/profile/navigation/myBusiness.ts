import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'

/** Profile → My Business (protected hub) */
export function navigateToMyBusiness() {
  router.push('/empresa/mi-negocio')
}

/** Redirect to onboarding when no company is linked */
export function redirectToCompanyOnboarding() {
  router.replace('/empresa/onboarding')
}

export function requireCompanyId(): string | null {
  return useProfileStore.getState().user.companyId ?? null
}

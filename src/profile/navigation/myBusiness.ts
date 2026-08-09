import { router } from 'expo-router'
import { useProfileStore } from '@/src/profile/store/useProfileStore'

/** Profile → My Business (protected hub) or claim flow */
export function navigateToMyBusiness() {
  // Prefer synced store only when role is company; otherwise claim flow.
  const user = useProfileStore.getState().user
  const companyId = user.role === 'company' ? user.companyId : undefined
  if (companyId) {
    router.push(`/empresa/${companyId}`)
    return
  }
  router.push('/empresa/onboarding')
}

/** Redirect to onboarding when no company is linked */
export function redirectToCompanyOnboarding() {
  router.replace('/empresa/onboarding')
}

export function requireCompanyId(): string | null {
  return useProfileStore.getState().user.companyId ?? null
}

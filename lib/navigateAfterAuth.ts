import { router } from 'expo-router'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import { getOnboardingDone } from '@/lib/onboardingStorage'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'
import {
  isOnboardingCompleteFromProfile,
  resolvePostAuthDestination,
  roleFromProfile,
  syncProfileStoreFromAuth,
} from '@/lib/appBootstrap'
import { needsLegalAcceptance } from '@/lib/legal'

/** Navigate after login/register/OAuth based on legal + onboarding + role. */
export async function navigateAfterAuth(
  user: User,
  profile: Profile | null,
): Promise<void> {
  syncProfileStoreFromAuth(user, profile)
  await syncAuthStoreFromSession(user, profile)

  const storageDone = await getOnboardingDone()
  const localUser = useProfileStore.getState().user
  const onboardingStoreDone = useOnboardingStore.getState().onboardingCompleted

  // Only count device onboarding flags when they belong to this user id.
  const sameUserLocal = localUser.id === user.id
  const hasCompletedOnboarding =
    isOnboardingCompleteFromProfile(profile) ||
    (sameUserLocal && localUser.onboardingCompleted) ||
    (sameUserLocal && onboardingStoreDone) ||
    (sameUserLocal && storageDone)

  const role = roleFromProfile(profile) ?? 'tourist'
  const companyId = profile?.business_place_id ?? null

  const destination = resolvePostAuthDestination({
    isAuthenticated: true,
    hasCompletedOnboarding,
    needsLegalAcceptance: needsLegalAcceptance(true, profile),
    role,
    companyId,
  })

  router.replace(destination)
}

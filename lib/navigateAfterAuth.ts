import { router } from 'expo-router'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import { getOnboardingDone } from '@/lib/onboardingStorage'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'
import {
  resolvePostAuthDestination,
  roleFromProfile,
  syncProfileStoreFromAuth,
} from '@/lib/appBootstrap'

/** Navigate after login/register/OAuth based on onboarding + role. */
export async function navigateAfterAuth(
  user: User,
  profile: Profile | null,
): Promise<void> {
  syncProfileStoreFromAuth(user, profile)
  await syncAuthStoreFromSession(user, profile)

  const storageDone = await getOnboardingDone()
  const localUser = useProfileStore.getState().user
  const onboardingStoreDone = useOnboardingStore.getState().onboardingCompleted

  const hasCompletedOnboarding =
    localUser.onboardingCompleted ||
    onboardingStoreDone ||
    profile?.account_type != null ||
    storageDone

  const role = roleFromProfile(profile) ?? localUser.role
  const companyId = profile?.business_place_id ?? localUser.companyId ?? null

  const destination = resolvePostAuthDestination({
    isAuthenticated: true,
    hasCompletedOnboarding,
    role,
    companyId,
  })

  router.replace(destination)
}

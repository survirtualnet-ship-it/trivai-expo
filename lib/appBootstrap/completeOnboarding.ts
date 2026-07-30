import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { setOnboardingDone, setBusinessIntent } from '@/lib/onboardingStorage'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { resolvePostAuthDestination } from './resolveDestination'
import type { UserRole } from './types'

type CompleteBase = {
  userId: string
  email?: string
  name?: string
  avatarUrl?: string
}

/** Tourist: persist role, Supabase account_type, local flags → home. */
export async function completeTouristOnboarding({
  userId,
  email,
  name,
  avatarUrl,
  city,
  locationPermission,
}: CompleteBase & {
  city?: string
  locationPermission?: boolean
}): Promise<void> {
  useOnboardingStore.getState().completeOnboarding()

  useProfileStore.getState().setUser({
    id: userId,
    email,
    name: name ?? useProfileStore.getState().user.name,
    avatarUrl: avatarUrl ?? useProfileStore.getState().user.avatarUrl,
    photo: avatarUrl,
    role: 'tourist',
    onboardingCompleted: true,
    city: city ?? useProfileStore.getState().user.city,
    locationPermission: locationPermission ?? false,
  })

  await setOnboardingDone()

  await supabase
    .from('profiles')
    .update({
      account_type: 'personal',
      city: city ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  const dest = resolvePostAuthDestination({
    isAuthenticated: true,
    hasCompletedOnboarding: true,
    role: 'tourist',
    companyId: null,
  })
  router.replace(dest)
}

/** Company: persist role, companyId, Supabase → dashboard or onboarding. */
export async function completeBusinessOnboarding({
  userId,
  email,
  name,
  companyId,
  businessName,
}: CompleteBase & {
  companyId: string
  businessName?: string
}): Promise<void> {
  useOnboardingStore.getState().completeOnboarding()

  useProfileStore.getState().setUser({
    id: userId,
    email,
    name: name ?? useProfileStore.getState().user.name,
    role: 'company',
    companyId,
    onboardingCompleted: true,
  })

  await setOnboardingDone()
  await setBusinessIntent()

  await supabase
    .from('profiles')
    .update({
      account_type: 'business',
      business_place_id: companyId,
      business_name: businessName ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  const dest = resolvePostAuthDestination({
    isAuthenticated: true,
    hasCompletedOnboarding: true,
    role: 'company',
    companyId,
  })
  router.replace(dest)
}

export function readBootstrapRole(): UserRole | null {
  return useProfileStore.getState().user.role
}

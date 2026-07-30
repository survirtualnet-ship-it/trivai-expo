import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useAuthHydrated, useAuthStore } from '@/src/auth/store/useAuthStore'
import { getOnboardingDone } from '@/lib/onboardingStorage'
import {
  resolveAppDestination,
  syncProfileStoreFromAuth,
  type BootstrapState,
} from '@/lib/appBootstrap'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'

function useStoreHydrated(): boolean {
  const [profileHydrated, setProfileHydrated] = useState(
    useProfileStore.persist.hasHydrated(),
  )
  const [onboardingHydrated, setOnboardingHydrated] = useState(
    useOnboardingStore.persist.hasHydrated(),
  )

  useEffect(() => {
    const unsubProfile = useProfileStore.persist.onFinishHydration(() => {
      setProfileHydrated(true)
    })
    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(() => {
      setOnboardingHydrated(true)
    })
    return () => {
      unsubProfile()
      unsubOnboarding()
    }
  }, [])

  return profileHydrated && onboardingHydrated
}

/**
 * Central bootstrap: session + persisted stores → destination.
 * Splash → Welcome → Auth → Onboarding → Module
 */
export function useAppBootstrap(): BootstrapState {
  const { user, profile, loading: checkingSession } = useUser()
  const authHydrated = useAuthHydrated()
  const authUser = useAuthStore(s => s.user)
  const authAuthenticated = useAuthStore(s => s.isAuthenticated)
  const authLoading = useAuthStore(s => s.isLoading)
  const storesHydrated = useStoreHydrated()
  const [storageDone, setStorageDone] = useState<boolean | null>(null)

  const profileUser = useProfileStore(s => s.user)
  const onboardingCompletedStore = useOnboardingStore(s => s.onboardingCompleted)

  useEffect(() => {
    getOnboardingDone().then(setStorageDone)
  }, [])

  useEffect(() => {
    if (user && profile) {
      syncProfileStoreFromAuth(user, profile)
      void syncAuthStoreFromSession(user, profile)
    }
  }, [user, profile])

  const isAuthenticated = authAuthenticated || !!user
  const role = authUser?.role ?? profileUser.role ?? null
  const companyId =
    authUser?.companyId ??
    profileUser.companyId ??
    profile?.business_place_id ??
    null

  const hasCompletedOnboarding =
    profileUser.onboardingCompleted ||
    onboardingCompletedStore ||
    profile?.account_type != null ||
    storageDone === true

  const loadingUser = storageDone === null
  const ready =
    authHydrated &&
    storesHydrated &&
    !checkingSession &&
    !authLoading &&
    !loadingUser

  return useMemo(() => {
    const { phase, destination } = ready
      ? resolveAppDestination({
          isAuthenticated,
          hasCompletedOnboarding,
          role,
          companyId,
        })
      : { phase: 'loading' as const, destination: '/welcome' as const }

    return {
      ready,
      checkingSession,
      loadingUser,
      storesHydrated,
      isAuthenticated,
      hasCompletedOnboarding,
      role,
      companyId,
      phase,
      destination,
    }
  }, [
    ready,
    checkingSession,
    loadingUser,
    storesHydrated,
    isAuthenticated,
    hasCompletedOnboarding,
    role,
    companyId,
  ])
}

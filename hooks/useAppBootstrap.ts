import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useAuthHydrated, useAuthStore } from '@/src/auth/store/useAuthStore'
import { getOnboardingDone } from '@/lib/onboardingStorage'
import {
  resolveAppDestination,
  roleFromProfile,
  syncProfileStoreFromAuth,
  type BootstrapState,
} from '@/lib/appBootstrap'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'
import { needsLegalAcceptance as checkNeedsLegal } from '@/lib/legal'
import { normalizeUserRole } from '@/lib/domain/user'

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
  const sessionUserId = user?.id ?? authUser?.id ?? null

  // Live Supabase profile wins. Stale auth/profile zustand must not revive
  // a previous account's company identity for a regular user.
  const roleFromDb = roleFromProfile(profile)
  const role =
    roleFromDb ??
    normalizeUserRole(authUser?.role ?? profileUser.role) ??
    null
  const activeBusinessId =
    profile?.business_place_id ??
    authUser?.activeBusinessId ??
    authUser?.companyId ??
    profileUser.activeBusinessId ??
    profileUser.companyId ??
    null
  const ownedBusinessIds = profileUser.businessIds ?? []

  const sameUserLocal = !!sessionUserId && profileUser.id === sessionUserId
  const hasCompletedOnboarding =
    profile?.account_type != null ||
    (sameUserLocal && profileUser.onboardingCompleted) ||
    (sameUserLocal && onboardingCompletedStore) ||
    (sameUserLocal && storageDone === true) ||
    (authAuthenticated &&
      !!authUser?.id &&
      profileUser.id === authUser.id &&
      profileUser.onboardingCompleted)

  const needsLegal =
    isAuthenticated && checkNeedsLegal(true, profile)

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
          needsLegalAcceptance: needsLegal,
          role,
          companyId: activeBusinessId,
          activeBusinessId,
        })
      : { phase: 'loading' as const, destination: '/welcome' as const }

    return {
      ready,
      checkingSession,
      loadingUser,
      storesHydrated,
      isAuthenticated,
      hasCompletedOnboarding,
      needsLegalAcceptance: needsLegal,
      role,
      companyId: activeBusinessId,
      activeBusinessId,
      ownedBusinessIds,
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
    needsLegal,
    role,
    activeBusinessId,
    ownedBusinessIds,
  ])
}

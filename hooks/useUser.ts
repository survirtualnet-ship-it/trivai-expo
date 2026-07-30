import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchCurrentUserSession } from '@/lib/queries/user'
import { userKeys, STALE } from '@/lib/queries/keys'
import { getOnboardingDone } from '@/lib/onboardingStorage'
import { useAuthStore } from '@/src/auth/store/useAuthStore'

export function useUser() {
  const queryClient = useQueryClient()
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  const sessionQuery = useQuery({
    queryKey: userKeys.session(),
    queryFn: fetchCurrentUserSession,
    staleTime: STALE.user,
  })

  useEffect(() => {
    getOnboardingDone().then(done => { if (done) setOnboardingDismissed(true) })
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const user = sessionQuery.data?.user ?? null
  const profile = sessionQuery.data?.profile ?? null

  const meta = user?.user_metadata ?? {}
  const fallbackName =
    profile?.full_name ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Explorador'

  const displayName = fallbackName.split(' ')[0]
  const initials = fallbackName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const avatarUrl =
    profile?.avatar_url ??
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null

  const isBusiness = profile?.account_type === 'business'
  const isOnboarded = profile?.account_type != null || onboardingDismissed
  const isAuthenticated = useAuthStore(s => s.isAuthenticated) || !!user

  const signOut = useCallback(async () => {
    await useAuthStore.getState().logout()
    queryClient.setQueryData(userKeys.session(), { user: null, profile: null })
    queryClient.invalidateQueries({ queryKey: userKeys.all })
  }, [queryClient])

  const refreshProfile = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: userKeys.session() })
  }, [queryClient])

  return {
    user,
    profile,
    loading: sessionQuery.isLoading,
    isAuthenticated,
    displayName,
    initials,
    avatarUrl,
    isBusiness,
    isOnboarded,
    signOut,
    refreshProfile,
    dismissOnboarding: () => setOnboardingDismissed(true),
  }
}

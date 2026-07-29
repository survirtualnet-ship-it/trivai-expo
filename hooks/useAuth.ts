import { useCallback, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import {
  fetchCurrentUser,
  signInGoogle,
  signOutUser,
  updateUserPrefs,
} from '@/services/user.service'
import type { User } from '@/types/user'
import { QUERY_KEYS } from '@/lib/constants'

/**
 * Auth + session for TRIVAI.
 * Supabase Auth (Google OAuth) with AsyncStorage-persisted session.
 */
export function useAuth() {
  const queryClient = useQueryClient()

  const authQuery = useQuery({
    queryKey: QUERY_KEYS.auth,
    queryFn: fetchCurrentUser,
    staleTime: 30_000,
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth })
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const user = authQuery.data ?? null
  const isAuthenticated = !!user

  const signInWithGoogle = useCallback(async () => {
    await signInGoogle()
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth })
  }, [queryClient])

  const signOut = useCallback(async () => {
    await signOutUser()
    queryClient.setQueryData(QUERY_KEYS.auth, null)
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth })
  }, [queryClient])

  const updatePrefs = useCallback(async (
    patch: Partial<Pick<User, 'share_location' | 'share_activity' | 'language' | 'theme'>>,
  ) => {
    if (!user) return
    await updateUserPrefs(user.id, patch)
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth })
  }, [user, queryClient])

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth })
  }, [queryClient])

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading: authQuery.isLoading,
    isError: authQuery.isError,
    signInWithGoogle,
    signOut,
    updatePrefs,
    refresh,
  }), [
    user,
    isAuthenticated,
    authQuery.isLoading,
    authQuery.isError,
    signInWithGoogle,
    signOut,
    updatePrefs,
    refresh,
  ])
}

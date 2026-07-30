import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'

/**
 * Bootstraps auth: restores session from Supabase + AsyncStorage
 * and keeps the Zustand store in sync with auth state changes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadSession = useAuthStore(s => s.loadSession)
  const clearSession = useAuthStore(s => s.clearSession)

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearSession()
          return
        }

        if (
          session?.user &&
          (event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED' ||
            event === 'INITIAL_SESSION' ||
            event === 'USER_UPDATED')
        ) {
          const profile = await ensureProfile(session.user)
          await syncAuthStoreFromSession(session.user, profile)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [clearSession])

  return <>{children}</>
}

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { syncAuthStoreFromSession } from '@/src/auth/syncAuthStore'
import { buildAuthUser } from '@/src/auth/buildAuthUser'

/**
 * Bootstraps auth: restores session from Supabase + AsyncStorage
 * and keeps the Zustand store in sync with auth state changes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadSession = useAuthStore(s => s.loadSession)
  const clearSession = useAuthStore(s => s.clearSession)
  const login = useAuthStore(s => s.login)

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
          // Sync store immediately so UI unlocks — profile can catch up async
          login({
            ...buildAuthUser(session.user, null),
            token: session.access_token,
          })

          void (async () => {
            try {
              const profile = await ensureProfile(session.user)
              await syncAuthStoreFromSession(session.user, profile)
            } catch (err) {
              console.warn('[auth] profile sync:', err)
            }
          })()
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [clearSession, login])

  return <>{children}</>
}

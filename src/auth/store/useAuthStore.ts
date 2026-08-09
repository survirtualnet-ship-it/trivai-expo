import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { fetchCurrentUserSession } from '@/lib/queries/user'
import { resolveOAuthSessionFromUrl } from '@/lib/auth/completeAuthCallback'
import { clearLocalSessionArtifacts } from '@/lib/appBootstrap/clearLocalSession'
import { buildAuthUser } from '../buildAuthUser'
import type { AuthUser, LoginPayload } from '../types'

const AUTH_STORAGE_KEY = 'trivai-auth'

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  rememberMe: boolean
  login: (userData: LoginPayload) => void
  clearSession: () => void
  logout: () => Promise<void>
  loadSession: () => Promise<void>
  setRememberMe: (value: boolean) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      rememberMe: true,

      login: (userData: LoginPayload) => {
        const { token, ...user } = userData
        set({
          user,
          token: token ?? get().token,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      clearSession: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await supabase.auth.signOut()
        } finally {
          clearLocalSessionArtifacts()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      loadSession: async () => {
        set({ isLoading: true })
        try {
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            const { search, hash } = window.location
            const hasOAuthParams =
              search.includes('code=') || hash.includes('access_token=')
            if (hasOAuthParams) {
              try {
                await resolveOAuthSessionFromUrl()
              } catch (err) {
                console.warn('[auth] oauth restore:', err)
              }
            }
          }

          const { data: { session } } = await supabase.auth.getSession()

          if (!session?.user) {
            clearLocalSessionArtifacts()
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
            return
          }

          let authUser = session.user
          let profile = null
          try {
            const fetched = await fetchCurrentUserSession()
            authUser = fetched.user ?? session.user
            profile = fetched.profile
          } catch (err) {
            console.warn('[auth] profile fetch:', err)
          }

          if (!authUser) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
            return
          }

          const user = buildAuthUser(authUser, profile)
          set({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setRememberMe: (value: boolean) => set({ rememberMe: value }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[auth] rehydrate failed', error)
        }
      },
    },
  ),
)

export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useAuthStore.persist.hasHydrated(),
  )

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}

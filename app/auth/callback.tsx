import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import {
  isPasswordRecoveryCallback,
  resolveOAuthSessionFromUrl,
} from '@/lib/auth/completeAuthCallback'
import { T, F } from '@/lib/tokens'

export default function AuthCallback() {
  useEffect(() => {
    let navigated = false
    const recoveryLink = isPasswordRecoveryCallback()

    const goHome = async (user: Parameters<typeof ensureProfile>[0]) => {
      if (navigated) return
      navigated = true
      await ensureProfile(user)
      router.replace('/')
    }

    const goResetPassword = () => {
      if (navigated) return
      navigated = true
      router.replace('/auth/reset-password')
    }

    const goLogin = () => {
      if (navigated) return
      navigated = true
      router.replace('/auth/login')
    }

    const finish = async () => {
      try {
        if (recoveryLink) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            goResetPassword()
            return
          }
        }

        const oauthSession = await resolveOAuthSessionFromUrl()
        if (oauthSession?.user) {
          await goHome(oauthSession.user)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          if (recoveryLink) {
            goResetPassword()
          } else {
            await goHome(session.user)
          }
        }
      } catch (err) {
        console.warn('Auth callback:', err)
        goLogin()
      }
    }

    void finish()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        goResetPassword()
        return
      }

      if (recoveryLink && session?.user) {
        goResetPassword()
        return
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        void goHome(session.user)
      }
    })

    const timeout = setTimeout(() => {
      if (!navigated) goLogin()
    }, 12_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg, gap: 16 }}>
      <ActivityIndicator color={T.purple} size="large" />
      <Text style={{ fontSize: F.size.sm, color: T.fg3 }}>Iniciando sesión...</Text>
    </View>
  )
}

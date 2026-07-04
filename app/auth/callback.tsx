import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { T, F } from '@/lib/tokens'

function isRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash
  const search = window.location.search
  return hash.includes('type=recovery') || search.includes('type=recovery')
}

export default function AuthCallback() {
  useEffect(() => {
    let navigated = false
    const recoveryLink = isRecoveryUrl()

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        goResetPassword()
        return
      }

      if (recoveryLink && session?.user) {
        goResetPassword()
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        goHome(session.user)
      }
    })

    const timeout = setTimeout(() => {
      if (!navigated) {
        navigated = true
        router.replace('/auth/login')
      }
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

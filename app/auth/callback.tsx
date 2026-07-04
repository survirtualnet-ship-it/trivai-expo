import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { T, F } from '@/lib/tokens'

export default function AuthCallback() {
  useEffect(() => {
    let navigated = false

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return
      // Tras link de recuperación Supabase entrega sesión temporal
      const type = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.hash.slice(1) : '',
      ).get('type')
      if (type === 'recovery') {
        goResetPassword()
        return
      }
      goHome(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
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
    }, 10_000)

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

import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { T, F } from '@/lib/tokens'

export default function AuthCallback() {
  useEffect(() => {
    let navigated = false

    const goHome = async (user: any) => {
      if (navigated) return
      navigated = true
      await ensureProfile(user)
      router.replace('/')
    }

    // Caso 1: la sesión ya está disponible (detectSessionInUrl la procesó al montar)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) goHome(session.user)
    })

    // Caso 2: Supabase termina de procesar el token y dispara SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        goHome(session.user)
      }
    })

    // Timeout de seguridad: si en 10s no hay sesión, volver al login
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

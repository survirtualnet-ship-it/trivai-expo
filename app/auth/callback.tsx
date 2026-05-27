import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { T } from '@/lib/tokens'

export default function AuthCallback() {
  const params = useLocalSearchParams()

  useEffect(() => {
    const code = params.code as string | undefined
    if (code) {
      supabase.auth.exchangeCodeForSession(
        typeof window !== 'undefined' ? window.location.href : ''
      ).then(() => router.replace('/'))
    } else {
      router.replace('/')
    }
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg }}>
      <ActivityIndicator color={T.purple} size="large" />
    </View>
  )
}

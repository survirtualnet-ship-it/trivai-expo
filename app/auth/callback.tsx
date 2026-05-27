import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { T } from '@/lib/tokens'

export default function AuthCallback() {
  useEffect(() => {
    const handle = async () => {
      if (typeof window === 'undefined') { router.replace('/'); return }

      const url = window.location.href
      const hasCode = url.includes('code=')
      const hasToken = url.includes('access_token=')

      if (hasCode || hasToken) {
        await supabase.auth.exchangeCodeForSession(url)
      }

      router.replace('/')
    }
    handle()
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg }}>
      <ActivityIndicator color={T.purple} size="large" />
    </View>
  )
}

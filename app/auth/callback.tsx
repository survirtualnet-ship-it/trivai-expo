import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { T } from '@/lib/tokens'

export default function AuthCallback() {
  useEffect(() => {
    const handle = async () => {
      if (typeof window === 'undefined') { router.replace('/'); return }

      // PKCE flow: Google returns ?code= in query string
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
        if (!error && data?.user) await ensureProfile(data.user)
        router.replace('/')
        return
      }

      // Implicit flow: Supabase returns #access_token= in hash fragment
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken  = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        })
        if (!error && data?.user) await ensureProfile(data.user)
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

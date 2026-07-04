import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { getAuthRedirectUrl } from '@/lib/auth/redirectUrl'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getAuthRedirectUrl('auth/callback')

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) throw error
    return
  }

  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  })

  if (oauthError) throw oauthError
  if (!data?.url) throw new Error('No se pudo iniciar el login con Google.')

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

  if (res.type === 'success' && res.url) {
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(res.url)
    if (exchangeError) throw exchangeError
    if (sessionData.user) await ensureProfile(sessionData.user)
    return
  }

  if (res.type !== 'cancel') {
    throw new Error('No se pudo completar el login con Google.')
  }
}

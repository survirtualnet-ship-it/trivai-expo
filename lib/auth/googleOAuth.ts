import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithGoogle(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: redirect the whole page (no popup) so the session lands in the main window
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
    if (error) throw error
    // Page navigates away — this line won't be reached
    return
  }

  // Native: use expo-web-browser in-app browser
  const redirectTo = Linking.createURL('auth/callback')
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

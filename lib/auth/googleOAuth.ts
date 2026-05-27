import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('auth/callback')
  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (oauthError) throw oauthError
  if (!data?.url) throw new Error('No se pudo iniciar el login con Google.')

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

  if (res.type === 'success' && res.url) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(res.url)
    if (exchangeError) throw exchangeError
    return
  }

  if (res.type !== 'cancel') {
    throw new Error('No se pudo completar el login con Google.')
  }
}

import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { getAuthRedirectUrl } from '@/lib/auth/redirectUrl'

WebBrowser.maybeCompleteAuthSession()

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getAuthRedirectUrl('auth/callback')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error) throw error
  if (!data?.url) throw new Error('No se pudo iniciar el login con Google.')

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      throw new Error('El login con Google solo está disponible en el navegador.')
    }
    // Navegación completa: evita que expo-router interrumpa el flujo OAuth
    window.location.assign(data.url)
    return
  }

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

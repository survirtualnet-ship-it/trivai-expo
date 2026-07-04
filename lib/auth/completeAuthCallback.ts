import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'

function hasOAuthError(): boolean {
  if (typeof window === 'undefined') return false
  const { search, hash } = window.location
  return search.includes('error=') || hash.includes('error=')
}

function hasOAuthCode(): boolean {
  if (typeof window === 'undefined') return false
  const { search, hash } = window.location
  return search.includes('code=') || hash.includes('access_token=')
}

function isRecoveryUrl(): boolean {
  if (typeof window === 'undefined') return false
  const { search, hash } = window.location
  return search.includes('type=recovery') || hash.includes('type=recovery')
}

function stripAuthParamsFromUrl(): void {
  if (typeof window === 'undefined') return
  window.history.replaceState({}, document.title, `${window.location.origin}/auth/callback`)
}

/** Intercambia el código PKCE y devuelve la sesión en web. En nativo no hace nada. */
export async function resolveOAuthSessionFromUrl() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null

  if (hasOAuthError()) {
    throw new Error('Inicio de sesión con Google cancelado o denegado.')
  }

  const { data: { session: existing } } = await supabase.auth.getSession()
  if (existing) return existing

  if (!hasOAuthCode()) return null

  const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
  stripAuthParamsFromUrl()

  if (error) {
    // detectSessionInUrl pudo haber consumido el código antes que este handler
    const { data: { session: retry } } = await supabase.auth.getSession()
    if (retry) return retry
    throw error
  }

  return data.session
}

export function isPasswordRecoveryCallback(): boolean {
  return isRecoveryUrl()
}

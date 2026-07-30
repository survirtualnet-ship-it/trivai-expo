import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

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

const SESSION_POLL_MS = 250

/** Poll until Supabase finishes PKCE / detectSessionInUrl on web. */
export async function waitForOAuthSession(timeoutMs = 15_000): Promise<Session | null> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null

  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (hasOAuthError()) {
      throw new Error('Inicio de sesión con Google cancelado o denegado.')
    }

    try {
      const resolved = await resolveOAuthSessionFromUrl()
      if (resolved?.user) return resolved
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('cancelado') || message.includes('denegado')) throw err
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) return session

    await new Promise(resolve => setTimeout(resolve, SESSION_POLL_MS))
  }

  return null
}

export function isPasswordRecoveryCallback(): boolean {
  return isRecoveryUrl()
}

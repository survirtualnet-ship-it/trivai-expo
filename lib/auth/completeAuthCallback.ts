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

/** Single-flight lock — avoid racing PKCE code exchange between AuthProvider and callback. */
let exchangeInFlight: Promise<Session | null> | null = null

async function exchangeCodeOnce(): Promise<Session | null> {
  if (exchangeInFlight) return exchangeInFlight

  exchangeInFlight = (async () => {
    try {
      const { data: { session: existing } } = await supabase.auth.getSession()
      if (existing?.user) {
        stripAuthParamsFromUrl()
        return existing
      }

      if (!hasOAuthCode()) return null

      const { data, error } = await supabase.auth.exchangeCodeForSession(
        window.location.href,
      )
      stripAuthParamsFromUrl()

      if (error) {
        const { data: { session: retry } } = await supabase.auth.getSession()
        if (retry?.user) return retry
        console.warn('[oauth] exchangeCodeForSession:', error.message)
        return null
      }

      return data.session
    } catch (err) {
      console.warn('[oauth] exchange failed:', err)
      const { data: { session } } = await supabase.auth.getSession()
      return session
    }
  })()

  try {
    return await exchangeInFlight
  } finally {
    // Keep lock briefly so parallel callers share the same result
    setTimeout(() => {
      exchangeInFlight = null
    }, 1500)
  }
}

/** Intercambia el código PKCE y devuelve la sesión en web. En nativo no hace nada. */
export async function resolveOAuthSessionFromUrl(): Promise<Session | null> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null

  if (hasOAuthError()) {
    throw new Error('Inicio de sesión con Google cancelado o denegado.')
  }

  const { data: { session: existing } } = await supabase.auth.getSession()
  if (existing?.user) return existing

  if (!hasOAuthCode()) return null

  return exchangeCodeOnce()
}

const SESSION_POLL_MS = 200

/** Poll until Supabase finishes PKCE / detectSessionInUrl on web. */
export async function waitForOAuthSession(timeoutMs = 12_000): Promise<Session | null> {
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

export function isAuthCallbackPath(pathname: string): boolean {
  return pathname === '/auth/callback' || pathname.startsWith('/auth/callback')
}

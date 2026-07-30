import { useEffect, useRef, useState } from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { navigateAfterAuth } from '@/lib/navigateAfterAuth'
import {
  isPasswordRecoveryCallback,
  waitForOAuthSession,
} from '@/lib/auth/completeAuthCallback'
import { supabase } from '@/lib/supabase'
import { T, F, S } from '@/lib/tokens'

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => {
      setTimeout(() => resolve(fallback), ms)
    }),
  ])
}

export default function AuthCallback() {
  const [status, setStatus] = useState('Iniciando sesión...')
  const navigatedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const recoveryLink = isPasswordRecoveryCallback()

    const safeReplace = (href: string) => {
      if (navigatedRef.current || cancelled) return
      navigatedRef.current = true
      router.replace(href as never)
    }

    const goHome = async (user: Parameters<typeof ensureProfile>[0]) => {
      if (navigatedRef.current || cancelled) return
      setStatus('Preparando tu perfil...')

      try {
        const profile = await withTimeout(ensureProfile(user), 6_000, null)
        if (navigatedRef.current || cancelled) return
        setStatus('Redirigiendo...')
        await navigateAfterAuth(user, profile)
        navigatedRef.current = true
      } catch (err) {
        console.warn('Auth callback goHome:', err)
        if (!navigatedRef.current) {
          safeReplace('/onboarding')
        }
      }
    }

    const finish = async () => {
      try {
        if (recoveryLink) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            safeReplace('/auth/reset-password')
            return
          }
        }

        setStatus('Validando con Google...')
        const oauthSession = await waitForOAuthSession(10_000)
        if (cancelled) return

        if (oauthSession?.user) {
          await goHome(oauthSession.user)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          if (recoveryLink) {
            safeReplace('/auth/reset-password')
          } else {
            await goHome(session.user)
          }
          return
        }

        setStatus('No se pudo completar el login')
        safeReplace('/auth/login')
      } catch (err) {
        console.warn('Auth callback:', err)
        safeReplace('/auth/login')
      }
    }

    void finish()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (navigatedRef.current || cancelled) return

      if (event === 'PASSWORD_RECOVERY') {
        safeReplace('/auth/reset-password')
        return
      }

      if (recoveryLink && session?.user) {
        safeReplace('/auth/reset-password')
        return
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        void goHome(session.user)
      }
    })

    const timeout = setTimeout(() => {
      if (!navigatedRef.current && !cancelled) {
        console.warn('Auth callback timeout — redirecting to login')
        safeReplace('/auth/login')
      }
    }, 15_000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <View style={styles.root}>
      <ActivityIndicator color={T.purple} size="large" />
      <Text style={styles.text}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.bg,
    gap: S.lg,
    padding: S.xxl,
  },
  text: {
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
  },
})

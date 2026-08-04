import { useState } from 'react'
import { router } from 'expo-router'
import { WelcomeScreen } from '@/onboarding/screens/WelcomeScreen'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { SplashScreen } from '@/components/SplashScreen'
import { signInWithGoogle } from '@/lib/auth/googleOAuth'
import { mapAuthError } from '@/lib/auth/authErrors'

/**
 * Pre-auth welcome — Google / email / registro.
 * Post-auth redirects are handled by AuthGuard only (no duplicate effects here).
 */
export default function WelcomeRoute() {
  const bootstrap = useAppBootstrap()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(mapAuthError(err, 'Error al iniciar sesión con Google.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  if (!bootstrap.ready) {
    return <SplashScreen message="Preparando tu experiencia…" />
  }

  return (
    <WelcomeScreen
      error={error}
      googleLoading={googleLoading}
      onGoogle={handleGoogle}
      onEmail={() => router.replace('/auth/login')}
      onRegister={() => router.replace('/auth/registro')}
    />
  )
}

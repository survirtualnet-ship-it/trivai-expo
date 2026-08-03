import { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Lock, Mail } from 'lucide-react-native'
import { Ionicons } from '@expo/vector-icons'
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthBranding } from '@/components/auth/AuthBranding'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { PrimaryButton } from '@/onboarding/components/PrimaryButton'
import { onboardingTheme as t } from '@/onboarding/lib/theme'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle } from '@/lib/auth/googleOAuth'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { navigateAfterAuth } from '@/lib/navigateAfterAuth'
import { getAuthRedirectUrl } from '@/lib/auth/redirectUrl'
import { mapAuthError } from '@/lib/auth/authErrors'
import { useAuthStore } from '@/src/auth/store/useAuthStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const rememberMe = useAuthStore(s => s.rememberMe)
  const setRememberMe = useAuthStore(s => s.setRememberMe)

  const isFormValid = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password],
  )

  const handleLogin = async () => {
    if (!isFormValid) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (err) {
      setError(mapAuthError(err, 'No se pudo iniciar sesión.'))
      setLoading(false)
      return
    }

    if (data.user) {
      const profile = await ensureProfile(data.user)
      await navigateAfterAuth(data.user, profile)
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
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

  const handleForgotPassword = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Ingresa tu email para recuperar la contraseña.')
      return
    }
    setLoading(true)
    setError('')

    const redirectTo = getAuthRedirectUrl('auth/callback')
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
    setLoading(false)

    if (err) {
      setError(mapAuthError(err, 'No se pudo enviar el correo de recuperación.'))
      return
    }
    Alert.alert(
      'Revisa tu correo',
      'Te enviamos un enlace para restablecer tu contraseña.',
    )
  }

  return (
    <AuthScreenLayout centered onBack={() => router.back()}>
      <AuthBranding
        title="Bienvenido a Trivai 👋"
        subtitle="Descubre lo mejor cerca de ti"
      />

      <AuthCard>
        <AuthErrorBanner message={error} />

        <View style={styles.form}>
          <AuthInput
            label="Email"
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
          />

          <AuthInput
            label="Contraseña"
            icon={Lock}
            password
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            onSubmitEditing={handleLogin}
            textContentType="password"
            autoComplete="password"
          />

          <Pressable onPress={handleForgotPassword} style={styles.forgotWrap}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: t.border, true: 'rgba(109, 94, 247, 0.35)' }}
              thumbColor={rememberMe ? t.accent : t.textMuted}
            />
            <Text style={styles.rememberLabel}>Recordarme</Text>
          </View>

          <PrimaryButton
            label="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={!isFormValid || googleLoading}
          />

          <AuthDivider />

          <PrimaryButton
            label="Continuar con Google"
            onPress={handleGoogleLogin}
            variant="secondary"
            loading={googleLoading}
            disabled={loading}
            icon={<Ionicons name="logo-google" size={18} color={t.text} />}
          />
        </View>
      </AuthCard>

      <AuthFooterLink
        prefix="¿No tienes cuenta?"
        linkLabel="Crear cuenta"
        onPress={() => router.push('/auth/registro')}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: t.spacing.lg,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -t.spacing.sm,
  },
  forgot: {
    fontSize: t.font.caption,
    fontWeight: '600',
    color: t.accent,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  rememberLabel: {
    fontSize: t.font.caption,
    color: t.textSecondary,
  },
})

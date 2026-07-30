import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { signInWithGoogle } from '../../lib/googleAuth'
import { onboardingTheme as t } from '../../lib/theme'
import type { BusinessGoogleLoginProps } from '../types'

export function GoogleLoginScreen({ navigation }: BusinessGoogleLoginProps) {
  const setGoogleUser = useOnboardingStore(s => s.setGoogleUser)
  const googleUser = useOnboardingStore(s => s.googleUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      setGoogleUser(user)
      navigation.navigate('BusinessSearch')
    } catch {
      setError('No pudimos iniciar sesión con Google. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingLayout
      title="Verifica tu identidad"
      subtitle="Inicia sesión con Google para registrar tu negocio en Trivai."
      footer={
        <PrimaryButton
          label={googleUser ? 'Continuar' : 'Continuar con Google'}
          loading={loading}
          onPress={() => {
            if (googleUser) navigation.navigate('BusinessSearch')
            else void handleSignIn()
          }}
        />
      }
    >
      <View style={styles.box}>
        {googleUser ? (
          <View style={styles.profile}>
            {googleUser.picture ? (
              <Image source={{ uri: googleUser.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>
                  {googleUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.name}>{googleUser.name}</Text>
              <Text style={styles.email}>{googleUser.email}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.hint}>
            Usaremos tu cuenta para validar que representas al negocio seleccionado en Google Maps.
          </Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  box: {
    gap: t.spacing.lg,
    paddingTop: t.spacing.md,
  },
  hint: {
    color: t.textSecondary,
    fontSize: t.font.body,
    lineHeight: 22,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.lg,
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: t.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: t.text,
    fontSize: t.font.subtitle,
    fontWeight: '700',
  },
  email: {
    color: t.textSecondary,
    fontSize: t.font.caption,
  },
  error: {
    color: t.accentSecondary,
    fontSize: t.font.caption,
  },
})

import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PrimaryButton } from '../components/PrimaryButton'
import { onboardingTheme as t } from '../lib/theme'
import { BrandAssets } from '@/lib/brandAssets'
import type { WelcomeProps } from '../types'

type Props = Partial<WelcomeProps> & {
  /** Expo Router entry */
  onGoogle?: () => void
  onEmail?: () => void
  onRegister?: () => void
  googleLoading?: boolean
  error?: string
  /** Legacy handlers */
  onLogin?: () => void
  onContinue?: () => void
}

export function WelcomeScreen({
  navigation,
  onGoogle,
  onEmail,
  onRegister,
  googleLoading = false,
  error,
  onLogin,
  onContinue,
}: Props) {
  const isExpoEntry = !!(onGoogle || onEmail || onRegister)

  const handleEmail = () => {
    if (onEmail) {
      onEmail()
      return
    }
    if (onLogin) {
      onLogin()
      return
    }
    navigation?.navigate('UserType')
  }

  const handleRegister = () => {
    if (onRegister) {
      onRegister()
      return
    }
    if (onContinue) {
      onContinue()
      return
    }
    navigation?.navigate('UserType')
  }

  return (
    <OnboardingLayout
      centered
      footer={
        isExpoEntry ? (
          <View style={styles.footer}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {onGoogle ? (
              <PrimaryButton
                label="Continuar con Google"
                variant="secondary"
                onPress={onGoogle}
                loading={googleLoading}
                disabled={googleLoading}
                icon={<Ionicons name="logo-google" size={18} color={t.text} />}
              />
            ) : null}
            <PrimaryButton
              label="Continuar con correo electrónico"
              variant="secondary"
              onPress={handleEmail}
              disabled={googleLoading}
            />
            <View style={styles.registerRow}>
              <Text style={styles.registerPrefix}>¿No tienes cuenta?</Text>
              <Pressable onPress={handleRegister} hitSlop={8}>
                <Text style={styles.registerLink}>Registrarse</Text>
              </Pressable>
            </View>
            <View style={styles.legalRow}>
              <Pressable onPress={() => router.push('/legal/terms')} hitSlop={6}>
                <Text style={styles.legalLink}>Términos</Text>
              </Pressable>
              <Text style={styles.legalDot}>·</Text>
              <Pressable onPress={() => router.push('/legal/privacy')} hitSlop={6}>
                <Text style={styles.legalLink}>Privacidad</Text>
              </Pressable>
              <Text style={styles.legalDot}>·</Text>
              <Pressable
                onPress={() => router.push('/legal/content-policy')}
                hitSlop={6}
              >
                <Text style={styles.legalLink}>Normas</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <PrimaryButton label="Continuar" onPress={handleRegister} />
            <PrimaryButton
              label="Ya tengo cuenta"
              variant="ghost"
              onPress={handleEmail}
            />
          </>
        )
      }
    >
      <View style={styles.hero}>
        <View style={styles.logoBadge}>
          <Image
            source={BrandAssets.logoT}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="Trivai"
          />
        </View>
        <Text style={styles.brand}>Trivai</Text>
        <Text style={styles.tagline}>Descubre qué hacer, aquí y ahora</Text>
        <Text style={styles.hint}>Planifica tu próxima experiencia</Text>
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.md,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  brand: {
    color: t.text,
    fontSize: t.font.hero,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: t.text,
    fontSize: t.font.subtitle,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: t.textSecondary,
    fontSize: t.font.body,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: t.spacing.sm,
  },
  footer: {
    gap: t.spacing.md,
  },
  error: {
    color: t.accentSecondary,
    fontSize: t.font.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
    paddingTop: t.spacing.sm,
  },
  registerPrefix: {
    color: t.textSecondary,
    fontSize: t.font.body,
  },
  registerLink: {
    color: t.accent,
    fontSize: t.font.body,
    fontWeight: '700',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: t.spacing.sm,
  },
  legalLink: {
    color: t.textMuted,
    fontSize: t.font.caption,
  },
  legalDot: {
    color: t.textMuted,
    fontSize: t.font.caption,
  },
})

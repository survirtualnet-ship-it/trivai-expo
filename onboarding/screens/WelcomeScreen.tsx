import { Image, StyleSheet, Text, View } from 'react-native'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PrimaryButton } from '../components/PrimaryButton'
import { onboardingTheme as t } from '../lib/theme'
import { BrandAssets } from '@/lib/brandAssets'
import type { WelcomeProps } from '../types'

type Props = WelcomeProps & {
  /** Expo Router — skip React Navigation */
  onContinue?: () => void
  onLogin?: () => void
}

export function WelcomeScreen({ navigation, onContinue, onLogin }: Props) {
  const handleContinue = () => {
    if (onContinue) {
      onContinue()
      return
    }
    navigation.navigate('UserType')
  }

  const handleLogin = () => {
    if (onLogin) {
      onLogin()
      return
    }
    navigation.navigate('UserType')
  }

  return (
    <OnboardingLayout
      centered
      footer={
        <>
          <PrimaryButton label="Continuar" onPress={handleContinue} />
          <PrimaryButton
            label="Ya tengo cuenta"
            variant="ghost"
            onPress={handleLogin}
          />
        </>
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
})

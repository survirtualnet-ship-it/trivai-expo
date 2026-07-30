import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PrimaryButton } from '../components/PrimaryButton'
import { onboardingTheme as t } from '../lib/theme'
import type { WelcomeProps } from '../types'

export function WelcomeScreen({ navigation }: WelcomeProps) {
  return (
    <OnboardingLayout
      centered
      footer={
        <>
          <PrimaryButton
            label="Continuar"
            onPress={() => navigation.navigate('UserType')}
          />
          <PrimaryButton
            label="Ya tengo cuenta"
            variant="ghost"
            onPress={() => navigation.navigate('UserType')}
          />
        </>
      }
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={[t.gradientStart, t.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBadge}
        >
          <Text style={styles.logoLetter}>T</Text>
        </LinearGradient>
        <Text style={styles.brand}>Trivai</Text>
        <Text style={styles.tagline}>Descubre qué hacer, aquí y ahora</Text>
        <Text style={styles.hint}>
          Una app basada en momentos para turistas que llegan a una ciudad nueva.
        </Text>
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
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  logoLetter: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
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

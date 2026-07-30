import { StyleSheet, Text, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { onboardingTheme as t } from '../../lib/theme'
import type { TouristDoneProps } from '../types'

export function TouristDoneScreen({ navigation }: TouristDoneProps) {
  const completeOnboarding = useOnboardingStore(s => s.completeOnboarding)
  const interests = useOnboardingStore(s => s.interests)
  const location = useOnboardingStore(s => s.location)

  const handleFinish = () => {
    completeOnboarding()
    navigation.getParent()?.goBack?.()
  }

  return (
    <OnboardingLayout
      centered
      footer={
        <PrimaryButton label="Ir al inicio" onPress={handleFinish} />
      }
    >
      <View style={styles.wrap}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Todo listo. Empecemos.</Text>
        <Text style={styles.subtitle}>
          Trivai ya conoce tus intereses y puede sugerirte qué hacer ahora.
        </Text>
        <View style={styles.summary}>
          <Text style={styles.summaryLine}>
            Intereses: {interests.length > 0 ? interests.length : '—'}
          </Text>
          <Text style={styles.summaryLine}>
            Ubicación: {location?.label ?? 'Sin definir'}
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: t.spacing.lg,
    paddingHorizontal: t.spacing.lg,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    color: t.text,
    fontSize: t.font.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: t.font.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  summary: {
    width: '100%',
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
    marginTop: t.spacing.md,
  },
  summaryLine: {
    color: t.textSecondary,
    fontSize: t.font.body,
  },
})

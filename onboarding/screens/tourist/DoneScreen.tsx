import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useUser } from '@/hooks/useUser'
import { completeTouristOnboarding } from '@/lib/appBootstrap'
import { onboardingTheme as t } from '../../lib/theme'
import type { TouristDoneProps } from '../types'

export function TouristDoneScreen(_props: TouristDoneProps) {
  const interests = useOnboardingStore(s => s.interests)
  const location = useOnboardingStore(s => s.location)
  const locationPermission = useProfileStore(s => s.user.locationPermission)
  const { user, profile, avatarUrl, displayName } = useUser()
  const [finishing, setFinishing] = useState(false)

  const handleFinish = async () => {
    if (!user?.id || finishing) return
    setFinishing(true)
    try {
      await completeTouristOnboarding({
        userId: user.id,
        email: user.email,
        name: profile?.full_name ?? displayName,
        avatarUrl: avatarUrl ?? undefined,
        city: location?.label ?? profile?.city,
        locationPermission: locationPermission ?? !!location,
      })
    } finally {
      setFinishing(false)
    }
  }

  return (
    <OnboardingLayout
      centered
      footer={
        <PrimaryButton
          label="Ir al inicio"
          loading={finishing}
          onPress={handleFinish}
        />
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
    fontSize: t.font.caption,
  },
})

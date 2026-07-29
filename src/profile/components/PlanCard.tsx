import { memo } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInRight } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { profileTheme } from '../theme'
import type { AutoPlan } from '../store/useProfileStore'

type Props = {
  plan: AutoPlan
  index: number
  onGenerate: (id: string) => void
}

export const PlanCard = memo(function PlanCard({ plan, index, onGenerate }: Props) {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 70).duration(380).springify()}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{plan.emoji}</Text>
        <View style={styles.texts}>
          <Text style={styles.title}>{plan.title}</Text>
          <Text style={styles.subtitle}>{plan.subtitle}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onGenerate(plan.id)
        }}
        disabled={plan.generating}
        style={({ pressed }) => [
          styles.cta,
          pressed && !plan.generating && styles.ctaPressed,
          plan.generating && styles.ctaDisabled,
        ]}
      >
        {plan.generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Generar plan</Text>
        )}
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    marginBottom: profileTheme.spacing.md,
    padding: profileTheme.spacing.xl,
    backgroundColor: profileTheme.surface,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: profileTheme.spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  texts: {
    flex: 1,
    gap: profileTheme.spacing.xs,
  },
  title: {
    color: profileTheme.text,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: profileTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: profileTheme.spacing.xl,
    paddingVertical: 12,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.accent,
    minWidth: 140,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaDisabled: {
    opacity: 0.75,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})

import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import type { Locale, QuickPlan } from '../data/mock'

type Props = {
  plan: QuickPlan
  locale: Locale
  onPress?: () => void
}

export const QuickPlanCard = memo(function QuickPlanCard({
  plan,
  locale,
  onPress,
}: Props) {
  const title = locale === 'EN' ? plan.titleEn : plan.titleEs
  const subtitle = locale === 'EN' ? plan.subtitleEn : plan.subtitleEs
  const cta = locale === 'EN' ? 'View plan' : 'Ver plan'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Image source={{ uri: plan.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.cta}>{cta}</Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.planBg,
    borderWidth: 1,
    borderColor: colors.planBorder,
    overflow: 'hidden',
    ...shadows.soft,
  },
  image: {
    width: '100%',
    height: 90,
    backgroundColor: colors.fill,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.section,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  cta: {
    marginTop: spacing.xs,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})

import { memo, type ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { onboardingTheme as t } from '../lib/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  title: string
  subtitle: string
  emoji: string
  selected: boolean
  onPress: () => void
  footer?: ReactNode
}

export const CardSelect = memo(function CardSelect({
  title,
  subtitle,
  emoji,
  selected,
  onPress,
  footer,
}: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 16, stiffness: 280 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 })
      }}
      style={[
        styles.card,
        selected && styles.cardSelected,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.topRow}>
        <Text style={styles.emoji}>{emoji}</Text>
        {selected ? (
          <Ionicons name="checkmark-circle" size={24} color={t.accent} />
        ) : (
          <View style={styles.radio} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {footer}
    </AnimatedPressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.xl,
    borderWidth: 1.5,
    borderColor: t.border,
    padding: t.spacing.xl,
    gap: t.spacing.sm,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  cardSelected: {
    borderColor: t.accent,
    backgroundColor: t.surfaceElevated,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: t.textMuted,
  },
  title: {
    color: t.text,
    fontSize: t.font.subtitle,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: t.font.body,
    lineHeight: 22,
  },
})

import { memo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { onboardingTheme as t } from '../lib/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  label: string
  emoji?: string
  selected: boolean
  onPress: () => void
}

export const CategoryChip = memo(function CategoryChip({
  label,
  emoji,
  selected,
  onPress,
}: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    void Haptics.selectionAsync()
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 16, stiffness: 300 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 })
      }}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={styles.text}>
        {emoji ? `${emoji} ` : ''}{label}
      </Text>
    </AnimatedPressable>
  )
})

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 12,
    borderRadius: t.radius.full,
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.border,
  },
  chipSelected: {
    backgroundColor: 'rgba(109,94,247,0.25)',
    borderColor: t.accent,
  },
  text: {
    color: t.text,
    fontSize: t.font.body,
    fontWeight: '600',
  },
})

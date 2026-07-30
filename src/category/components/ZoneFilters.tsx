import { memo, useCallback } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { ZONES, type Locale, type ZoneId } from '@/src/data/mock'
import { categoryTheme } from '../theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  locale: Locale
  selected: ZoneId | null
  onSelect: (zone: ZoneId | null) => void
}

function ZoneChip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.94, { damping: 16, stiffness: 300 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 })
      }}
      style={[styles.chip, active && styles.chipActive, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </AnimatedPressable>
  )
}

export const ZoneFilters = memo(function ZoneFilters({
  locale,
  selected,
  onSelect,
}: Props) {
  const handlePress = useCallback(
    (id: ZoneId) => {
      void Haptics.selectionAsync()
      onSelect(selected === id ? null : id)
    },
    [onSelect, selected],
  )

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      style={styles.root}
    >
      {ZONES.map(zone => {
        const active = selected === zone.id
        const label = locale === 'EN' ? zone.labelEn : zone.labelEs
        return (
          <ZoneChip
            key={zone.id}
            label={label}
            active={active}
            onPress={() => handlePress(zone.id)}
          />
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  root: {
    flexGrow: 0,
    backgroundColor: categoryTheme.bg,
    borderBottomWidth: 1,
    borderBottomColor: categoryTheme.border,
    paddingVertical: categoryTheme.spacing.md,
  },
  list: {
    paddingHorizontal: categoryTheme.spacing.lg,
    gap: categoryTheme.spacing.sm,
  },
  chip: {
    height: 38,
    paddingHorizontal: categoryTheme.spacing.lg,
    borderRadius: categoryTheme.radius.full,
    backgroundColor: categoryTheme.surface,
    borderWidth: 1,
    borderColor: categoryTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: categoryTheme.accentSoft,
    borderColor: categoryTheme.accent,
  },
  label: {
    color: categoryTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: categoryTheme.text,
    fontWeight: '700',
  },
})

import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { activityTheme } from '../theme'
import type { ActivityTab } from '../store/useActivityStore'

const TABS: { id: ActivityTab; label: string }[] = [
  { id: 'personal', label: 'Para ti' },
  { id: 'friends', label: 'Amigos' },
]

type Props = {
  selected: ActivityTab
  onSelect: (tab: ActivityTab) => void
}

export const ActivityTabs = memo(function ActivityTabs({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      {TABS.map(tab => (
        <TabButton
          key={tab.id}
          label={tab.label}
          active={selected === tab.id}
          onPress={() => {
            void Haptics.selectionAsync()
            onSelect(tab.id)
          }}
        />
      ))}
    </View>
  )
})

function TabButton({
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
    <Animated.View style={[styles.tabOuter, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 16, stiffness: 280 })
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 220 })
        }}
        style={[styles.tab, active && styles.tabActive]}
      >
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: activityTheme.spacing.sm,
    paddingHorizontal: activityTheme.spacing.lg,
  },
  tabOuter: {
    flex: 1,
  },
  tab: {
    paddingVertical: 12,
    borderRadius: activityTheme.radius.full,
    backgroundColor: activityTheme.surface,
    borderWidth: 1,
    borderColor: activityTheme.border,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: activityTheme.accentSoft,
    borderColor: activityTheme.accent,
  },
  label: {
    color: activityTheme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: activityTheme.text,
    fontWeight: '700',
  },
})

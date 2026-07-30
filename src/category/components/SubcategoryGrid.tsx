import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { categoryTheme } from '../theme'
import type { Locale, Subcategory } from '../data/mockCategoryData'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  subcategories: Subcategory[]
  selectedId: string | null
  locale: Locale
  tint: string
  onSelect: (id: string | null) => void
}

function SubcategoryCell({
  item,
  label,
  active,
  tint,
  onPress,
}: {
  item: Subcategory
  label: string
  active: boolean
  tint: string
  onPress: () => void
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 16, stiffness: 280 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.cell,
        active && styles.cellActive,
        active && { borderColor: tint },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={22}
          color={active ? tint : categoryTheme.textSecondary}
        />
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
        {label}
      </Text>
    </AnimatedPressable>
  )
}

export const SubcategoryGrid = memo(function SubcategoryGrid({
  subcategories,
  selectedId,
  locale,
  tint,
  onSelect,
}: Props) {
  const handlePress = useCallback(
    (id: string) => {
      void Haptics.selectionAsync()
      onSelect(selectedId === id ? null : id)
    },
    [onSelect, selectedId],
  )

  const rows: Subcategory[][] = []
  for (let i = 0; i < subcategories.length; i += 2) {
    rows.push(subcategories.slice(i, i + 2))
  }

  return (
    <View style={styles.wrap}>
      {rows.map(row => (
        <View key={row.map(s => s.id).join('-')} style={styles.row}>
          {row.map(item => {
            const active = selectedId === item.id
            const label = locale === 'EN' ? item.nameEn : item.nameEs
            return (
              <SubcategoryCell
                key={item.id}
                item={item}
                label={label}
                active={active}
                tint={tint}
                onPress={() => handlePress(item.id)}
              />
            )
          })}
          {row.length === 1 ? <View style={styles.cellSpacer} /> : null}
        </View>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: categoryTheme.spacing.lg,
    paddingTop: categoryTheme.spacing.lg,
    gap: categoryTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: categoryTheme.spacing.md,
  },
  cell: {
    flex: 1,
    backgroundColor: categoryTheme.surface,
    borderRadius: categoryTheme.radius.lg,
    borderWidth: 1,
    borderColor: categoryTheme.border,
    paddingVertical: categoryTheme.spacing.lg,
    paddingHorizontal: categoryTheme.spacing.md,
    alignItems: 'center',
    gap: categoryTheme.spacing.sm,
    shadowColor: categoryTheme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  cellActive: {
    backgroundColor: categoryTheme.surfaceElevated,
  },
  cellSpacer: {
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: categoryTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: categoryTheme.text,
  },
})

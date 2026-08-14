import { memo } from 'react'
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { FONT } from '@/lib/typography'
import { T, S, R } from '@/src/design'
import { EXPLORE_CATEGORIES } from '@/lib/explore/mockPlaces'
import type { ExploreCategoryId } from '@/lib/explore/types'

type Props = {
  selected: ExploreCategoryId
  onSelect: (id: ExploreCategoryId) => void
}

export const CategoryFilter = memo(function CategoryFilter({
  selected,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
      style={styles.scroll}
    >
      {EXPLORE_CATEGORIES.map(cat => {
        const active = cat.id === selected
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={cat.label}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    backgroundColor: T.surface,
  },
  row: {
    paddingHorizontal: S.lg,
    paddingBottom: S.md,
    gap: S.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: T.muted,
  },
  chipActive: {
    backgroundColor: T.primary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: 14,
    fontWeight: '500',
    color: T.fg2,
  },
  labelActive: {
    color: T.onPrimary,
  },
})

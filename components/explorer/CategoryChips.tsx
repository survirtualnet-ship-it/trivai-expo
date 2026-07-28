import { memo } from 'react'
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { EXPLORER_CHIPS, type ExplorerChipId } from '@/lib/explorerCategories'

type Props = {
  selected: ExplorerChipId
  onSelect: (id: ExplorerChipId) => void
}

export const ExplorerCategoryChips = memo(function ExplorerCategoryChips({
  selected,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
    >
      {EXPLORER_CHIPS.map(chip => {
        const active = chip.id === selected
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={chip.label}
          >
            <Text style={styles.emoji}>{chip.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{chip.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    alignItems: 'center',
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: S.md,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: T.muted,
  },
  chipActive: {
    backgroundColor: T.fg1,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg2,
  },
  labelActive: {
    color: '#fff',
  },
})

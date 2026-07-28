import { memo } from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
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
    >
      {EXPLORER_CHIPS.map(chip => {
        const active = chip.id === selected
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.88}
          >
            <Text style={styles.emoji}>{chip.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{chip.label}</Text>
          </TouchableOpacity>
        )
      })}
      <View style={styles.spacer} />
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    alignItems: 'center',
  },
  spacer: { width: S.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  chipActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  emoji: { fontSize: 15 },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
  labelActive: {
    color: '#fff',
  },
})

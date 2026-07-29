import { memo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { activityTheme } from '../theme'
import type { ActivityFilter } from '../store/useActivityStore'

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'visit', label: 'Visitas' },
  { id: 'save', label: 'Guardados' },
  { id: 'live', label: 'En vivo' },
]

type Props = {
  active: ActivityFilter
  onSelect: (filter: ActivityFilter) => void
}

export const FilterChips = memo(function FilterChips({ active, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {FILTERS.map(chip => {
        const isActive = chip.id === active
        return (
          <Pressable
            key={chip.id}
            onPress={() => {
              void Haptics.selectionAsync()
              onSelect(chip.id)
            }}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{chip.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: activityTheme.spacing.lg,
    gap: activityTheme.spacing.sm,
    paddingVertical: activityTheme.spacing.sm,
  },
  chip: {
    paddingHorizontal: activityTheme.spacing.lg,
    paddingVertical: 8,
    borderRadius: activityTheme.radius.full,
    backgroundColor: activityTheme.surface,
    borderWidth: 1,
    borderColor: activityTheme.border,
  },
  chipActive: {
    backgroundColor: activityTheme.accentSoft,
    borderColor: activityTheme.accent,
  },
  label: {
    color: activityTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: activityTheme.text,
  },
})

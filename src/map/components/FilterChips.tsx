import { memo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { mapTheme } from '../theme'
import { useMapStore, type MapFilterId } from '../store/useMapStore'

const FILTERS: { id: MapFilterId; label: string }[] = [
  { id: 'cerca', label: 'Cerca de ti' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'para_ti', label: 'Para ti' },
  { id: 'eventos', label: 'Eventos' },
]

export const FilterChips = memo(function FilterChips() {
  const activeFilter = useMapStore(s => s.activeFilter)
  const setActiveFilter = useMapStore(s => s.setActiveFilter)
  const visible = useMapStore(s => s.filtersVisible)

  if (!visible) return null

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      style={styles.root}
    >
      {FILTERS.map(chip => {
        const active = chip.id === activeFilter
        return (
          <Pressable
            key={chip.id}
            onPress={() => setActiveFilter(chip.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{chip.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  root: {
    flexGrow: 0,
  },
  list: {
    paddingHorizontal: mapTheme.spacing.lg,
    gap: mapTheme.spacing.sm,
  },
  chip: {
    paddingHorizontal: mapTheme.spacing.lg,
    paddingVertical: 10,
    borderRadius: mapTheme.radius.full,
    backgroundColor: mapTheme.surface,
    borderWidth: 1,
    borderColor: mapTheme.border,
  },
  chipActive: {
    backgroundColor: mapTheme.accentSoft,
    borderColor: mapTheme.accent,
  },
  label: {
    color: mapTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: mapTheme.text,
  },
})

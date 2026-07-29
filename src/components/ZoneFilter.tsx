import { memo, useCallback } from 'react'
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight } from '../theme'
import { ZONES, type Locale, type ZoneId } from '../data/mock'

type Props = {
  locale: Locale
  selected: ZoneId | null
  onSelect: (zone: ZoneId | null) => void
}

export const ZoneFilter = memo(function ZoneFilter({
  locale,
  selected,
  onSelect,
}: Props) {
  const onPress = useCallback(
    (id: ZoneId) => {
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
          <Pressable
            key={zone.id}
            onPress={() => onPress(zone.id)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  root: {
    flexGrow: 0,
    marginTop: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  labelActive: {
    color: colors.white,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
})

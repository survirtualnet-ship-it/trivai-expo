import type { ComponentType } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

/** Chip de categoría con icono — filtros horizontales */
export function CategoryChip({
  label, Icon, color, bg, onPress, active = false,
}: {
  label: string
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>
  color: string
  bg: string
  onPress: () => void
  active?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: active ? color : bg },
        active && styles.chipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon size={14} color={active ? '#fff' : color} strokeWidth={2} />
      <Text style={[styles.chipText, { color: active ? '#fff' : color }]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
  },
  chipActive: {
    ...SHADOW.sm,
  },
  chipText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
  },
})

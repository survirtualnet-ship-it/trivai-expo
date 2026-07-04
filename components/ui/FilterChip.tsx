import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  label: string
  active?: boolean
  onPress: () => void
  accent?: string
}

export function FilterChip({ label, active, onPress, accent = T.primary }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

export function FilterChipGhost({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.ghost} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  text: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
  textActive: {
    color: '#fff',
  },
  ghost: {
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
    backgroundColor: T.muted,
    borderWidth: 1,
    borderColor: T.border,
  },
  ghostText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.primary,
  },
})

import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'

type Props = {
  label: string
  active: boolean
  onPress: () => void
}

export function FilterPill({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.pill, active ? styles.active : styles.inactive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: S.lg,
    paddingVertical: 10,
    borderRadius: R.full,
  },
  inactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: T.border,
  },
  active: {
    backgroundColor: T.green,
    borderWidth: 1,
    borderColor: T.green,
  },
  text: {
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
  textActive: {
    color: '#FFFFFF',
  },
})

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R } from '@/lib/tokens'

type Props = {
  id: string
  label: string
  emoji?: string
  active: boolean
  onPress: () => void
}

export function CategoryChip({ id, label, emoji, active, onPress }: Props) {
  const isTodos = id === 'Todos'

  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {isTodos ? (
        <Text style={styles.emoji}>{emoji ?? '🗺️'}</Text>
      ) : (
        <View style={styles.thumb}>
          <CatCover category={id} variant="thumb" style={{ height: 28 }} />
        </View>
      )}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: T.surface,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  chipActive: {
    backgroundColor: T.purple,
    borderColor: T.purple,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  emoji:  { fontSize: 16 },
  label:  { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  labelActive: { color: '#fff' },
})

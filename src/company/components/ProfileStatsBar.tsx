import { View, Text, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'

type Props = {
  profilePercent: number
  productCount: number
  galleryCount: number
  lastUpdatedLabel: string
}

export function ProfileStatsBar({
  profilePercent,
  productCount,
  galleryCount,
  lastUpdatedLabel,
}: Props) {
  return (
    <View style={styles.wrap}>
      <StatChip label="Perfil completo" value={`${profilePercent}%`} />
      <StatChip label="Productos" value={`${productCount} publicados`} />
      <StatChip label="Galería" value={`${galleryCount} fotos`} />
      <StatChip label="Última actualización" value={lastUpdatedLabel} wide />
    </View>
  )
}

function StatChip({
  label,
  value,
  wide,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <View style={[styles.chip, wide && styles.chipWide]}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  chip: {
    width: '47%',
    backgroundColor: T.muted,
    borderRadius: R.md,
    padding: S.md,
    gap: 2,
  },
  chipWide: { width: '100%' },
  chipLabel: { fontSize: F.size.xs, color: T.fg3, fontWeight: '600' },
  chipValue: { fontSize: F.size.md, color: T.fg1, fontWeight: '800' },
})

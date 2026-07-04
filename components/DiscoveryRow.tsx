import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { normalizeCategory, getCatColor } from '@/lib/categories'
import { T, F, S, R } from '@/lib/tokens'
import { HeartButton } from '@/components/HeartButton'

type Props = {
  category: string
  title: string
  /** Estado destacado junto a la categoría, ej. "Abierto" (verde) */
  status?: { label: string; color: string } | null
  /** Líneas secundarias: lugar, fecha, etc. */
  lines?: string[]
  distance?: string
  rating?: number | null
  trailing?: ReactNode
  photoUri?: string | null
  onPress: () => void
}

export function DiscoveryRow({
  category, title, status, lines = [], distance, rating, trailing, photoUri, onPress,
}: Props) {
  const label = normalizeCategory(category)
  const catColor = getCatColor(category)
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumb}>
        <CatCover category={category} variant="thumb" photoUri={photoUri} style={{ height: 64 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          <Text style={{ color: catColor, fontWeight: F.weight.semibold }}>{label}</Text>
          {status ? (
            <>
              <Text style={{ color: T.fg4 }}> · </Text>
              <Text style={{ color: status.color, fontWeight: F.weight.semibold }}>{status.label}</Text>
            </>
          ) : null}
        </Text>
        {lines.map((line, i) => (
          <Text key={i} style={styles.line} numberOfLines={1}>{line}</Text>
        ))}
        {(distance || rating) ? (
          <Text style={styles.dist} numberOfLines={1}>
            {rating ? `⭐ ${rating.toFixed(1)}` : ''}
            {rating && distance ? '  ·  ' : ''}
            {distance ?? ''}
          </Text>
        ) : null}
      </View>
      <View style={styles.trailing}>
        <HeartButton size={18} />
        {trailing}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.sm,
    marginBottom: S.sm,
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: R.md,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: T.muted,
  },
  content: { flex: 1, minWidth: 0, gap: 1 },
  title:   { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  meta:    { fontSize: F.size.xs },
  line:    { fontSize: F.size.xs, color: T.fg3 },
  dist:    { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  trailing:{ flexShrink: 0, alignItems: 'flex-end', gap: 6, alignSelf: 'stretch', justifyContent: 'space-between', paddingVertical: 2 },
})

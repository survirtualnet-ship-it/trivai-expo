import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { normalizeCategory } from '@/lib/categories'
import { T, F, S, R } from '@/lib/tokens'

type Props = {
  category: string
  title: string
  lines?: string[]
  trailing?: ReactNode
  photoUri?: string | null
  onPress: () => void
}

export function DiscoveryRow({ category, title, lines = [], trailing, photoUri, onPress }: Props) {
  const label = normalizeCategory(category)
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumb}>
        <CatCover category={category} variant="thumb" photoUri={photoUri} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.cat}>{label}</Text>
        {lines.map((line, i) => (
          <Text key={i} style={styles.line} numberOfLines={1}>{line}</Text>
        ))}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: R.md,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: T.muted,
  },
  content: { flex: 1, minWidth: 0 },
  title:   { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  cat:     { fontSize: F.size.xs, color: T.purple, fontWeight: F.weight.semibold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  line:    { fontSize: F.size.sm, color: T.fg3, marginTop: 3 },
  trailing:{ flexShrink: 0, alignSelf: 'center' },
})

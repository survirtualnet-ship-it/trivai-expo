import { View, Text, TouchableOpacity, StyleSheet, type ReactNode } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R } from '@/lib/tokens'
import { HeartButton } from '@/components/HeartButton'

type Props = {
  category: string
  title: string
  subtitle?: string
  /** Texto de la pill sobre la foto (ej. "Evento", "Lugar" o la categoría) */
  pillLabel?: string
  pillColor?: string
  distance?: string
  badge?: ReactNode
  photoUri?: string | null
  onPress: () => void
}

export function DiscoveryCard({
  category, title, subtitle, pillLabel, pillColor = T.purple,
  distance, badge, photoUri, onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.photoWrap}>
        <CatCover category={category} variant="banner" photoUri={photoUri} style={{ height: 150 }} />
        {pillLabel ? (
          <View style={[styles.pill, { backgroundColor: pillColor }]}>
            <Text style={styles.pillText}>{pillLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        <View style={styles.footer}>
          {distance ? (
            <Text style={styles.dist}>{distance}</Text>
          ) : badge ?? <View />}
          <HeartButton size={18} />
        </View>
        {distance && badge ? <View style={{ marginTop: 4 }}>{badge}</View> : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    overflow: 'hidden',
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  photoWrap: {
    position: 'relative',
    borderRadius: R.xl,
    overflow: 'hidden',
    margin: 6,
    marginBottom: 0,
  },
  pill: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  pillText: {
    fontSize: 11,
    fontWeight: F.weight.bold,
    color: '#fff',
  },
  body: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    gap: 2,
  },
  title: {
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  subtitle: {
    fontSize: F.size.sm,
    color: T.fg3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dist: {
    fontSize: F.size.xs,
    color: T.fg3,
  },
})

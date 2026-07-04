import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { T, F, S, R, getCatLabel } from '@/lib/tokens'

const { width: SW } = Dimensions.get('window')
export const FEATURED_W = SW - S.lg * 2
const CARD_H = 300

export type FeaturedEvent = {
  id: string
  name: string
  category: string
  start_datetime: string
  place?: { name: string } | null
}

function formatFechaLarga(dt: string) {
  const d = new Date(dt)
  return d.toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  event: FeaturedEvent
  saved?: boolean
  onSaveToggle?: (active: boolean) => void
  onPress: () => void
}

export function FeaturedEventCard({ event, saved, onSaveToggle, onPress }: Props) {
  const catLabel = getCatLabel(event.category)

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <CatCover category={event.category} variant="hero" style={styles.cover} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.12)', 'rgba(10,8,14,0.85)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Destacado</Text>
        </View>
        <HeartButton floating size={20} eventId={event.id} initialActive={saved} managed onToggle={onSaveToggle} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
        <Text style={styles.meta}>{formatFechaLarga(event.start_datetime)}</Text>
        {event.place?.name ? (
          <Text style={styles.meta} numberOfLines={1}>{event.place.name}</Text>
        ) : null}
        <View style={styles.catPill}>
          <Text style={styles.catText}>{catLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export function FeaturedDots({ count, active }: { count: number; active: number }) {
  if (count <= 1) return null
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: FEATURED_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: T.muted,
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
    height: CARD_H,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    position: 'absolute',
    top: S.lg,
    left: S.lg,
    right: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: T.orange,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
  },
  badgeText: {
    fontSize: F.size.xs,
    fontWeight: F.weight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  info: {
    position: 'absolute',
    left: S.lg,
    right: S.lg,
    bottom: S.lg,
    gap: 4,
  },
  title: {
    fontSize: F.size.xxl + 2,
    fontWeight: F.weight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  meta: {
    fontSize: F.size.sm,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: F.weight.medium,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: T.purple,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    marginTop: S.sm,
  },
  catText: {
    fontSize: F.size.xs,
    fontWeight: F.weight.bold,
    color: '#FFFFFF',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: S.lg,
    marginBottom: S.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.border,
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.purple,
  },
})

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MapPin, Calendar } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { T, F, S, R, SHADOW, getCatLabel } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { formatEventDateShort } from '@/lib/eventUtils'
import type { EventCardData } from '@/components/ui/EventCard'

const { width: SW } = Dimensions.get('window')
export const HERO_W = SW - S.lg * 2
export const HERO_H = Math.round(SW * 0.62)

type Props = {
  event: EventCardData
  saved?: boolean
  onSaveToggle?: (active: boolean) => void
  onPress: () => void
  ctaLabel?: string
  badge?: string
}

export function HeroCard({ event, saved, onSaveToggle, onPress, ctaLabel = 'Ver evento', badge = 'Destacado' }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.94}>
      <CatCover category={event.category} variant="hero" style={styles.cover} />
      <LinearGradient
        colors={['transparent', 'rgba(10,8,14,0.35)', 'rgba(10,8,14,0.88)']}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.top}>
        <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        <HeartButton floating size={20} eventId={event.id} initialActive={saved} managed onToggle={onSaveToggle} />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.cat}>{getCatLabel(event.category)}</Text>
        <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
        <View style={styles.metaRow}>
          <Calendar size={14} color="rgba(255,255,255,0.9)" />
          <Text style={styles.meta}>{formatEventDateShort(event.start_datetime)}</Text>
        </View>
        {event.place?.name && (
          <View style={styles.metaRow}>
            <MapPin size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.meta} numberOfLines={1}>{event.place.name}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.cta} onPress={onPress} activeOpacity={0.9}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: HERO_W,
    height: HERO_H,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.muted,
    ...SHADOW.lg,
  },
  cover: { ...StyleSheet.absoluteFillObject, height: HERO_H },
  top: {
    position: 'absolute',
    top: S.lg,
    left: S.lg,
    right: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: T.accent,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    fontWeight: F.weight.bold,
    color: '#fff',
  },
  bottom: {
    position: 'absolute',
    left: S.lg,
    right: S.lg,
    bottom: S.lg,
    gap: 6,
  },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.hero,
    fontWeight: F.weight.bold,
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: 'rgba(255,255,255,0.92)',
    flex: 1,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: S.sm,
    backgroundColor: '#fff',
    paddingHorizontal: S.xl,
    paddingVertical: 11,
    borderRadius: R.full,
  },
  ctaText: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.primary,
  },
})

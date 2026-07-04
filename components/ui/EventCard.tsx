import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MapPin, Clock } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { AvatarGroup, type AvatarItem } from '@/components/ui/AvatarGroup'
import { T, F, S, R, SHADOW, getCatLabel } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { formatEventDateShort, formatEventTime } from '@/lib/eventUtils'

export type EventCardData = {
  id: string
  name: string
  category: string
  start_datetime: string
  attendees_count?: number
  is_free?: boolean
  place?: { name: string; address?: string | null } | null
  _dist?: number
  photos?: string[] | null
}

type Props = {
  event: EventCardData
  variant?: 'horizontal' | 'vertical' | 'list'
  attendees?: AvatarItem[]
  saved?: boolean
  onSaveToggle?: (active: boolean) => void
  onPress: () => void
  ctaLabel?: string
}

function socialLabel(count?: number) {
  const n = count ?? 0
  if (n <= 0) return null
  return `${n} persona${n !== 1 ? 's' : ''} van`
}

export function EventCard({
  event, variant = 'vertical', attendees = [], saved, onSaveToggle, onPress, ctaLabel = 'Ver',
}: Props) {
  const social = socialLabel(event.attendees_count)
  const distLabel = event._dist != null ? `${event._dist < 1 ? Math.round(event._dist * 1000) + ' m' : event._dist.toFixed(1) + ' km'}` : null

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.hCard} onPress={onPress} activeOpacity={0.92}>
        <CatCover category={event.category} variant="banner" style={styles.hCover} />
        <View style={styles.hBody}>
          <Text style={styles.hTitle} numberOfLines={2}>{event.name}</Text>
          <Text style={styles.meta}>{formatEventDateShort(event.start_datetime)}</Text>
          {social && (
            <View style={styles.socialRow}>
              {attendees.length > 0 && <AvatarGroup items={attendees} max={3} size={22} />}
              <Text style={styles.socialText}>{social}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.92}>
        <CatCover category={event.category} variant="thumb" style={styles.listCover} />
        <View style={styles.listBody}>
          <Text style={styles.listCat}>{getCatLabel(event.category)}</Text>
          <Text style={styles.listTitle} numberOfLines={2}>{event.name}</Text>
          <View style={styles.listMeta}>
            <Clock size={12} color={T.fg3} />
            <Text style={styles.meta}>{formatEventTime(event.start_datetime)}</Text>
          </View>
          {event.place?.name && (
            <View style={styles.listMeta}>
              <MapPin size={12} color={T.fg3} />
              <Text style={styles.meta} numberOfLines={1}>{event.place.name}{distLabel ? ` · ${distLabel}` : ''}</Text>
            </View>
          )}
          {social && (
            <View style={styles.socialRow}>
              {attendees.length > 0 && <AvatarGroup items={attendees} max={3} size={20} />}
              <Text style={styles.socialText}>{social}</Text>
            </View>
          )}
        </View>
        <View style={styles.listCta}>
          <Text style={styles.listCtaText}>{ctaLabel}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={styles.vCard} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.vCoverWrap}>
        <CatCover category={event.category} variant="banner" style={styles.vCover} />
        <View style={styles.vHeart}>
          <HeartButton floating size={18} eventId={event.id} initialActive={saved} managed onToggle={onSaveToggle} />
        </View>
      </View>
      <View style={styles.vBody}>
        <Text style={styles.vTitle} numberOfLines={2}>{event.name}</Text>
        <Text style={styles.meta}>{formatEventDateShort(event.start_datetime)}</Text>
        {social && (
          <View style={[styles.socialRow, { marginTop: S.sm }]}>
            {attendees.length > 0 && <AvatarGroup items={attendees} max={3} size={22} />}
            <Text style={styles.socialText}>{social}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const CARD_W = 260

const styles = StyleSheet.create({
  hCard: {
    width: CARD_W,
    borderRadius: R.xl,
    backgroundColor: T.surface,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  hCover: { height: 140, width: '100%' },
  hBody: { padding: S.md, gap: 4 },
  hTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  vCard: {
    width: CARD_W,
    borderRadius: R.xl,
    backgroundColor: T.surface,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  vCoverWrap: { position: 'relative' },
  vCover: { height: 150 },
  vHeart: { position: 'absolute', top: S.sm, right: S.sm },
  vBody: { padding: S.md },
  vTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.md,
    ...SHADOW.sm,
  },
  listCover: { width: 72, height: 72, borderRadius: R.lg, overflow: 'hidden' },
  listBody: { flex: 1, minWidth: 0, gap: 2 },
  listCat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: T.fg3,
    flex: 1,
  },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: 4 },
  socialText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.secondary,
    fontWeight: F.weight.semibold,
  },
  listCta: {
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.full,
    backgroundColor: T.purpleSoft,
  },
  listCtaText: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    color: T.primary,
    fontWeight: F.weight.bold,
  },
})

export const EVENT_CARD_W = CARD_W

import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Star, Clock, MapPin } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { AppLocale } from '@/lib/i18n/discover'
import { DISCOVER_STRINGS } from '@/lib/i18n/discover'
import {
  badgeLabel,
  catDisplay,
  type DiscoverBadge,
} from '@/lib/discoverCardUtils'

export const DISCOVER_CAROUSEL_W = 200
const IMAGE_H = 168
const CARD_H = 248

type Props = {
  title: string
  category: string
  locale?: AppLocale
  photoUri?: string | null
  rating?: number | null
  minutes?: string | null
  zone?: string | null
  isOpen?: boolean | null
  badge?: DiscoverBadge | null
  onPress: () => void
}

export const DiscoverCarouselCard = memo(function DiscoverCarouselCard({
  title,
  category,
  locale = 'es',
  photoUri,
  rating,
  minutes,
  zone,
  isOpen,
  badge,
  onPress,
}: Props) {
  const t = DISCOVER_STRINGS[locale]
  const cat = catDisplay(category, locale)
  const showStatus = isOpen != null

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageWrap}>
        <CatCover
          category={category}
          variant="banner"
          photoUri={photoUri}
          style={styles.image}
        />
        {badge && (
          <View style={[styles.badge, badge === 'popular' && styles.badgeAccent]}>
            <Text style={styles.badgeText}>{badgeLabel(badge, locale)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {rating != null && rating > 0 && (
            <View style={styles.rating}>
              <Star size={11} color={T.accent} fill={T.accent} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {(minutes || zone) && (
          <View style={styles.metaRow}>
            {minutes && (
              <>
                <Clock size={11} color={T.fg3} />
                <Text style={styles.meta}>{minutes}</Text>
              </>
            )}
            {zone && (
              <>
                <MapPin size={11} color={T.fg3} />
                <Text style={styles.meta} numberOfLines={1}>{zone}</Text>
              </>
            )}
          </View>
        )}

        <View style={styles.footer}>
          {showStatus && (
            <Text style={[styles.status, { color: isOpen ? T.secondary : T.fg3 }]}>
              {isOpen ? t.open : t.closed}
            </Text>
          )}
          <Text style={styles.cat} numberOfLines={1}>{cat}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

export const DiscoverCarouselSkeleton = memo(function DiscoverCarouselSkeleton() {
  return <View style={styles.skeleton} />
})

const styles = StyleSheet.create({
  card: {
    width: DISCOVER_CAROUSEL_W,
    height: CARD_H,
    borderRadius: R.xl,
    backgroundColor: T.surface,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  imageWrap: {
    height: IMAGE_H,
    position: 'relative',
  },
  image: {
    height: IMAGE_H,
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: S.sm,
    left: S.sm,
    backgroundColor: T.primary,
    paddingHorizontal: S.sm,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  badgeAccent: {
    backgroundColor: T.accent,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 9,
    fontWeight: F.weight.bold,
    color: '#fff',
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    gap: 3,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
  },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
    marginRight: S.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.xs,
  },
  status: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
  },
  cat: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  skeleton: {
    width: DISCOVER_CAROUSEL_W,
    height: CARD_H,
    borderRadius: R.xl,
    backgroundColor: T.muted,
  },
})

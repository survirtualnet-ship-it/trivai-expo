import { memo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { MapPin, Sparkles } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { RatingCompact } from '@/components/ui/Rating'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'
import { firstPhoto } from '@/lib/discoverCardUtils'
import type { ExplorerPlace } from '@/lib/explorerRanking'

type Props = {
  place: ExplorerPlace
  focused?: boolean
  fullWidth?: boolean
  onPress: () => void
}

export const ExplorerPlaceCard = memo(function ExplorerPlaceCard({
  place,
  focused,
  fullWidth = false,
  onPress,
}: Props) {
  const photo = firstPhoto(place.photos)
  const minutes = place._dist != null ? distToMinutes(place._dist) : null

  return (
    <TouchableOpacity
      style={[styles.card, fullWidth && styles.cardFull, focused && styles.cardFocused]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrap}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
        ) : (
          <CatCover category={place.category} variant="banner" style={styles.image} />
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{place.priceTier}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{place.name}</Text>
          <RatingCompact value={place.rating_avg ?? 0} size="sm" />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.cat}>{getCatLabel(place.category)}</Text>
          {minutes != null && (
            <View style={styles.dist}>
              <MapPin size={11} color={T.fg3} />
              <Text style={styles.meta}>{minutes} min</Text>
            </View>
          )}
        </View>

        <View style={styles.whyRow}>
          <Sparkles size={12} color={T.primary} />
          <Text style={styles.why} numberOfLines={2}>{place.whyRecommended}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const CARD_W = 280

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    overflow: 'hidden',
    marginRight: S.md,
    ...SHADOW.md,
  },
  cardFull: {
    width: '100%',
    marginRight: 0,
    marginBottom: S.md,
  },
  cardFocused: {
    borderWidth: 2,
    borderColor: T.primary,
  },
  imageWrap: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: S.sm,
    right: S.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    color: '#fff',
    letterSpacing: 1,
  },
  body: {
    padding: S.md,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  title: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cat: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: T.purpleSoft,
    padding: S.sm,
    borderRadius: R.md,
  },
  why: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.purpleInk,
    lineHeight: 16,
  },
})

export const EXPLORER_CARD_WIDTH = CARD_W

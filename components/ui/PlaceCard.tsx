import { memo } from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { Clock, MapPin } from 'lucide-react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { SharePlaceButton } from '@/components/SharePlaceButton'
import { RatingCompact } from '@/components/ui/Rating'
import { TagRow } from '@/components/ui/Tag'
import { CategoryCardFromMeta } from '@/components/ui/CategoryCard'
import { T, F, S, R, SHADOW, getCatLabel } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { UI, PLACE_CARD_W, PLACE_CARD_IMAGE_H, uiText } from '@/lib/ui/styles'
import { calcIsOpen } from '@/lib/hours'
import { distToMinutes } from '@/lib/zones'
import type { AppLocale } from '@/lib/i18n/discover'
import { DISCOVER_STRINGS, categoryLabel } from '@/lib/i18n/discover'
import { firstPhoto } from '@/lib/discoverCardUtils'

export type { PlaceCardData } from './PlaceCard.types'
export { derivePlaceCardTags } from './PlaceCard.types'

import type { PlaceCardData } from './PlaceCard.types'
import { derivePlaceCardTags } from './PlaceCard.types'

export { CategoryChip } from '@/components/ui/CategoryChip'

export type PlaceCardVariant = 'vertical' | 'horizontal' | 'compact'

export type PlaceCardProps = {
  place: PlaceCardData
  onPress: () => void
  variant?: PlaceCardVariant
  tags?: string[]
  showHeart?: boolean
  showShare?: boolean
  locale?: AppLocale
  width?: number
}

export const PlaceCard = memo(function PlaceCard({
  place,
  onPress,
  variant = 'vertical',
  tags,
  showHeart = true,
  showShare = false,
  locale = 'es',
  width = PLACE_CARD_W,
}: PlaceCardProps) {
  switch (variant) {
    case 'horizontal':
      return (
        <PlaceCardHorizontal
          place={place}
          onPress={onPress}
          showHeart={showHeart}
          showShare={showShare}
          locale={locale}
        />
      )
    case 'compact':
      return (
        <PlaceCardCompact
          place={place}
          onPress={onPress}
          showHeart={showHeart}
          showShare={showShare}
          locale={locale}
        />
      )
    default:
      return (
        <PlaceCardVertical
          place={place}
          onPress={onPress}
          tags={tags}
          showHeart={showHeart}
          showShare={showShare}
          locale={locale}
          width={width}
        />
      )
  }
})

type SharedProps = Pick<
  PlaceCardProps,
  'place' | 'onPress' | 'showHeart' | 'showShare' | 'locale'
>

const PlaceCardVertical = memo(function PlaceCardVertical({
  place,
  onPress,
  tags,
  showHeart,
  showShare,
  locale,
  width,
}: SharedProps & { tags?: string[]; width?: number }) {
  const t = DISCOVER_STRINGS[locale ?? 'es']
  const minutes = place._dist != null ? distToMinutes(place._dist) : null
  const photo = firstPhoto(place.photos)
  const cardTags = tags ?? derivePlaceCardTags(place, locale ?? 'es')
  const catLabel = locale === 'es'
    ? getCatLabel(place.category)
    : categoryLabel(place.category, locale ?? 'es')

  return (
    <Pressable
      style={({ pressed }) => [
        styles.verticalCard,
        width != null && { width },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      <PlaceCardImage
        category={place.category}
        photo={photo}
        height={PLACE_CARD_IMAGE_H}
        showHeart={showHeart}
        showShare={showShare}
        place={place}
      />

      <View style={styles.verticalBody}>
        <Text style={uiText.title} numberOfLines={2}>{place.name}</Text>

        <View style={styles.metaRow}>
          <RatingCompact
            value={place.rating_avg ?? 0}
            count={place.rating_count}
            size="sm"
          />
          <Text style={styles.category}>{catLabel}</Text>
        </View>

        {minutes != null && (
          <View style={styles.dist}>
            <Clock size={11} color={T.fg3} />
            <Text style={uiText.meta}>{minutes} {t.min}</Text>
          </View>
        )}

        <TagRow tags={cardTags} variant="secondary" max={2} />
      </View>
    </Pressable>
  )
})

const PlaceCardHorizontal = memo(function PlaceCardHorizontal({
  place,
  onPress,
  showHeart,
  showShare,
  locale,
}: SharedProps) {
  const t = DISCOVER_STRINGS[locale ?? 'es']
  const minutes = place._dist != null ? distToMinutes(place._dist) : null
  const photo = firstPhoto(place.photos)
  const catLabel = locale === 'es'
    ? getCatLabel(place.category)
    : categoryLabel(place.category, locale ?? 'es')

  return (
    <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.92}>
      <CatCover category={place.category} variant="thumb" photoUri={photo} style={styles.horizontalCover} />

      <View style={styles.horizontalBody}>
        <Text style={uiText.title} numberOfLines={2}>{place.name}</Text>
        <RatingCompact value={place.rating_avg ?? 0} count={place.rating_count} size="sm" />
        <Text style={styles.category}>{catLabel}</Text>
        {minutes != null && (
          <View style={styles.dist}>
            <Clock size={11} color={T.fg3} />
            <Text style={uiText.meta}>{minutes} {t.min}</Text>
          </View>
        )}
      </View>

      <PlaceCardActions place={place} showHeart={showHeart} showShare={showShare} />
    </TouchableOpacity>
  )
})

const PlaceCardCompact = memo(function PlaceCardCompact({
  place,
  onPress,
  showHeart,
  showShare,
  locale,
}: SharedProps) {
  const t = DISCOVER_STRINGS[locale ?? 'es']
  const isOpen = calcIsOpen(place.hours, place.is_open ?? false)
  const minutes = place._dist != null ? distToMinutes(place._dist) : null
  const zone = place._zone ?? null
  const catLabel = locale === 'es'
    ? getCatLabel(place.category)
    : categoryLabel(place.category, locale ?? 'es')

  return (
    <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.92}>
      <CatCover category={place.category} variant="thumb" style={styles.compactCover} />
      <View style={styles.compactBody}>
        <Text style={uiText.title} numberOfLines={2}>{place.name}</Text>
        <RatingCompact value={place.rating_avg ?? 0} size="sm" />
        <Text style={styles.category}>{catLabel}</Text>
        {minutes != null && (
          <View style={styles.dist}>
            <Clock size={11} color={T.fg3} />
            <Text style={uiText.meta}>{minutes} {t.min}</Text>
          </View>
        )}
        <Text style={[styles.status, { color: isOpen ? T.secondary : T.fg3 }]}>
          {isOpen ? t.open : t.closed}
        </Text>
        {zone && (
          <View style={styles.dist}>
            <MapPin size={11} color={T.fg3} />
            <Text style={uiText.meta}>{t.zone} {zone}</Text>
          </View>
        )}
      </View>
      <PlaceCardActions place={place} showHeart={showHeart} showShare={showShare} />
    </TouchableOpacity>
  )
})

function PlaceCardImage({
  category,
  photo,
  height,
  showHeart,
  showShare,
  place,
}: {
  category: string
  photo: string | null
  height: number
  showHeart?: boolean
  showShare?: boolean
  place: PlaceCardData
}) {
  return (
    <View style={[styles.imageWrap, { height }]}>
      <CatCover
        category={category}
        variant="banner"
        photoUri={photo}
        style={{ height, width: '100%' }}
      />
      {(showShare || showHeart) && (
        <View style={styles.imageActions}>
          {showShare && <SharePlaceButton place={place} />}
          {showHeart && <HeartButton size={18} placeId={place.id} />}
        </View>
      )}
    </View>
  )
}

function PlaceCardActions({
  place,
  showHeart,
  showShare,
}: {
  place: PlaceCardData
  showHeart?: boolean
  showShare?: boolean
}) {
  if (!showShare && !showHeart) return null
  return (
    <View style={styles.compactActions}>
      {showShare && <SharePlaceButton place={place} />}
      {showHeart && <HeartButton size={18} placeId={place.id} />}
    </View>
  )
}

/** @deprecated Use PlaceCard variant="compact" */
export const PlaceCardRow = PlaceCardCompact

export function ZoneCard({
  nombre, emoji, bg, onPress,
}: { nombre: string; emoji: string; bg: string; fg: string; onPress: () => void }) {
  return (
    <CategoryCardFromMeta title={nombre} emoji={emoji} color={bg} onPress={onPress} />
  )
}

const styles = StyleSheet.create({
  verticalCard: {
    ...UI.card,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    position: 'relative',
  },
  imageActions: {
    position: 'absolute',
    top: S.sm,
    right: S.sm,
    alignItems: 'center',
    gap: 2,
  },
  verticalBody: {
    ...UI.cardBody,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  category: {
    fontFamily: FONT.medium,
    fontSize: F.size.xs,
    color: T.fg3,
    letterSpacing: -0.1,
  },
  dist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UI.metaGap,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.md,
    ...SHADOW.md,
  },
  horizontalCover: {
    width: 96,
    height: 96,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  horizontalBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.md,
    ...SHADOW.sm,
  },
  compactCover: {
    width: 72,
    height: 72,
    borderRadius: R.lg,
    overflow: 'hidden',
  },
  compactBody: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  status: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
  },
  compactActions: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
})

export const ZONE_CARD_W = 128

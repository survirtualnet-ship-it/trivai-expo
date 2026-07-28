import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Star } from 'lucide-react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { getCatLabel } from '@/lib/tokens'
import { distToMinutes } from '@/lib/zones'
import type { PlaceDetail } from '@/lib/placeDetail'

type Props = {
  place: PlaceDetail
}

export const PlaceInfo = memo(function PlaceInfo({ place }: Props) {
  const minutes = place.distance != null ? distToMinutes(place.distance) : null
  const cat = getCatLabel(place.category)

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{place.name}</Text>

      <View style={styles.ratingRow}>
        {place.rating > 0 ? (
          <>
            <Star size={16} color={T.accent} fill={T.accent} />
            <Text style={styles.ratingVal}>{place.rating.toFixed(1)}</Text>
            {place.reviewCount > 0 && (
              <Text style={styles.reviews}>
                {place.reviewCount} {place.reviewCount === 1 ? 'reseña' : 'reseñas'}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.reviews}>Sin reseñas aún</Text>
        )}
      </View>

      <Text style={styles.meta} numberOfLines={2}>
        {cat}
        {place.priceLabel ? ` · ${place.priceLabel}` : ''}
        {minutes != null ? ` · ${minutes} min` : ''}
        {place.isOpen ? ' · Abierto' : place.openingHours.length ? ' · Cerrado' : ''}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.xxl,
    paddingBottom: S.md,
    backgroundColor: T.surface,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: 32,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: S.md,
  },
  ratingVal: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
  reviews: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
  meta: {
    marginTop: S.sm,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    lineHeight: 22,
  },
})

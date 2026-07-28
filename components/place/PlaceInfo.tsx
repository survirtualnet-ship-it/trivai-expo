import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Star, MapPin } from 'lucide-react-native'
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
  const km = place.distance != null ? place.distance.toFixed(1) : null

  return (
    <View style={styles.wrap}>
      <Text style={styles.name}>{place.name}</Text>

      <View style={styles.ratingRow}>
        {place.rating > 0 ? (
          <>
            <Star size={18} color={T.accent} fill={T.accent} />
            <Text style={styles.ratingVal}>{place.rating.toFixed(1)}</Text>
            {place.reviewCount > 0 && (
              <Text style={styles.reviews}>({place.reviewCount})</Text>
            )}
          </>
        ) : (
          <Text style={styles.noRating}>Sin reseñas aún</Text>
        )}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.category}>{getCatLabel(place.category)}</Text>
        {minutes != null && (
          <>
            <Text style={styles.dot}>·</Text>
            <View style={styles.dist}>
              <MapPin size={14} color={T.fg3} />
              <Text style={styles.distText}>
                {minutes} min{km ? ` · ${km} km` : ''}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.xl,
    paddingBottom: S.lg,
    backgroundColor: T.surface,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: F.size.hero,
    fontWeight: F.weight.bold,
    color: T.fg1,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: S.sm,
  },
  ratingVal: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  reviews: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  noRating: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: S.sm,
    gap: 4,
  },
  category: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
  },
  dot: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg4,
    marginHorizontal: 2,
  },
  dist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
})

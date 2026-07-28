import { memo } from 'react'
import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { CatCover } from '@/components/CatCover'
import { HeartButton } from '@/components/HeartButton'
import { firstPhoto } from '@/lib/discoverCardUtils'
import { getCatLabel } from '@/lib/tokens'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { PlaceCardData } from '@/components/ui/PlaceCard'

type Props = {
  place: PlaceCardData
  onPress: () => void
}

export const FavoritePlaceRow = memo(function FavoritePlaceRow({
  place,
  onPress,
}: Props) {
  const photo = firstPhoto(place.photos)
  const meta = [
    getCatLabel(place.category),
    place.rating_avg ? place.rating_avg.toFixed(1) : null,
  ].filter(Boolean).join(' · ')

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={styles.thumb} />
      ) : (
        <CatCover
          category={place.category}
          variant="thumb"
          photoUri={photo}
          style={styles.thumb}
        />
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
      </View>

      <HeartButton size={18} placeId={place.id} />
    </Pressable>
  )
})

type GridProps = {
  place: PlaceCardData
  onPress: () => void
  width: number
}

export const FavoritePlaceTile = memo(function FavoritePlaceTile({
  place,
  onPress,
  width,
}: GridProps) {
  const photo = firstPhoto(place.photos)

  return (
    <Pressable
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={[styles.tileImage, { width, height: width * 0.85 }]} />
      ) : (
        <CatCover
          category={place.category}
          variant="banner"
          photoUri={photo}
          style={[styles.tileImage, { width, height: width * 0.85 }]}
        />
      )}
      <Text style={styles.tileName} numberOfLines={2}>{place.name}</Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: 12,
    paddingHorizontal: S.lg,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: T.muted,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: R.lg,
    overflow: 'hidden',
    backgroundColor: T.muted,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
  },
  tileImage: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.muted,
  },
  tileName: {
    marginTop: S.sm,
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg1,
    letterSpacing: -0.1,
  },
})

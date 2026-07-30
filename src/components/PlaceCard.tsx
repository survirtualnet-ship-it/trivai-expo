import { memo, useMemo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import { zoneLabel, type Locale, type PlaceItem } from '../data/mock'

type Props = {
  place: PlaceItem
  locale?: Locale
  onPress?: () => void
}

export const PlaceCard = memo(function PlaceCard({ place, locale = 'ES', onPress }: Props) {
  const meta = useMemo(() => {
    const zone = zoneLabel(place.zone, locale)
    return `${place.distance} · ${zone} · ${place.category}`
  }, [place.category, place.distance, place.zone, locale])

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${meta}`}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {place.name}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {meta}
        </Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...shadows.card,
  },
  imageWrap: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.fill,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 20,
  },
  meta: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})

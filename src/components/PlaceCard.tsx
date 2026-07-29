import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import type { PlaceItem } from '../data/mock'

type Props = {
  place: PlaceItem
  onPress?: () => void
}

export const PlaceCard = memo(function PlaceCard({ place, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {place.category}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.distance}>{place.distance}</Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 160,
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
  category: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.accent,
    lineHeight: 16,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    lineHeight: 20,
  },
  distance: {
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

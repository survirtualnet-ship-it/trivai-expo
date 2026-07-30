import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { formatDistance, type CategoryPlace } from '../data/mockCategoryData'
import { categoryTheme } from '../theme'

type Props = {
  place: CategoryPlace
  onPress?: () => void
}

export const PlaceCard = memo(function PlaceCard({ place, onPress }: Props) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${formatDistance(place.distanceKm)}`}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color={categoryTheme.recommended} />
          <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {place.categoryLabel} · {formatDistance(place.distanceKm)}
        </Text>
      </View>
    </Pressable>
  )
})

const CARD_WIDTH = 168

export const PLACE_CARD_WIDTH = CARD_WIDTH
export const PLACE_CARD_STRIDE = CARD_WIDTH + categoryTheme.spacing.md

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: categoryTheme.surface,
    borderRadius: categoryTheme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: categoryTheme.border,
    marginRight: categoryTheme.spacing.md,
    shadowColor: categoryTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 104,
    backgroundColor: categoryTheme.surfaceElevated,
  },
  ratingBadge: {
    position: 'absolute',
    top: categoryTheme.spacing.sm,
    right: categoryTheme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(11,15,26,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: categoryTheme.radius.full,
  },
  ratingText: {
    color: categoryTheme.text,
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: categoryTheme.spacing.md,
    gap: categoryTheme.spacing.xs,
  },
  name: {
    color: categoryTheme.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  meta: {
    color: categoryTheme.textSecondary,
    fontSize: 12,
  },
})

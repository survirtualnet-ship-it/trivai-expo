import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { mapTheme } from '../theme'
import type { MapPlace } from '../store/useMapStore'
import { placeImage } from '../utils/placeHelpers'

export const MAP_PLACE_CARD_WIDTH = 220
const CARD_MARGIN = mapTheme.spacing.md

export const MAP_PLACE_CARD_STRIDE = MAP_PLACE_CARD_WIDTH + CARD_MARGIN

const AnimatedView = Animated.createAnimatedComponent(View)

type Props = {
  place: MapPlace
  active: boolean
  distance: string
  onPress: () => void
  onPressVerMas?: () => void
}

export const PlaceCard = memo(function PlaceCard({
  place,
  active,
  distance,
  onPress,
  onPressVerMas,
}: Props) {
  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(active ? 1.04 : 1, {
            damping: 16,
            stiffness: 220,
          }),
        },
      ],
    }),
    [active],
  )

  const handleVerMas = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPressVerMas?.()
  }

  return (
    <AnimatedView style={[styles.card, active && styles.cardActive, animatedStyle]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: placeImage(place) }} style={styles.image} />
        {active && onPressVerMas ? (
          <View style={styles.imageOverlay}>
            <Pressable
              onPress={handleVerMas}
              style={({ pressed }) => [styles.verMasBtn, pressed && styles.verMasPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Ver más sobre ${place.name}`}
            >
              <Text style={styles.verMasText}>Ver más</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          ★ {place.rating.toFixed(1)} · {place.category} · {distance}
        </Text>
        {place.isTrending && <Text style={styles.tag}>🔥 Trending</Text>}
      </Pressable>
    </AnimatedView>
  )
})

const styles = StyleSheet.create({
  card: {
    width: MAP_PLACE_CARD_WIDTH,
    backgroundColor: mapTheme.surface,
    borderRadius: mapTheme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: mapTheme.border,
    marginRight: CARD_MARGIN,
    shadowColor: mapTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cardActive: {
    borderColor: mapTheme.accent,
    borderWidth: 2,
    shadowColor: mapTheme.accent,
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 96,
    backgroundColor: mapTheme.surfaceElevated,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  verMasBtn: {
    backgroundColor: mapTheme.accent,
    borderRadius: mapTheme.radius.full,
    paddingHorizontal: mapTheme.spacing.lg,
    paddingVertical: 10,
    minWidth: 112,
    alignItems: 'center',
    shadowColor: mapTheme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  verMasPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  verMasText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    padding: mapTheme.spacing.md,
    gap: mapTheme.spacing.xs,
  },
  name: {
    color: mapTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: mapTheme.textSecondary,
    fontSize: 12,
  },
  tag: {
    color: mapTheme.trending,
    fontSize: 11,
    fontWeight: '600',
  },
})

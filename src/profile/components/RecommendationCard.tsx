import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { profileTheme } from '../theme'
import type { ProfileRecommendation } from '../store/useProfileStore'

type Props = {
  item: ProfileRecommendation
  onPress?: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const RecommendationCard = memo(function RecommendationCard({ item, onPress }: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <AnimatedPressable
      onPress={() => {
        void Haptics.selectionAsync()
        onPress?.()
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 16, stiffness: 280 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 })
      }}
      style={[
        styles.card,
        item.highlight && styles.cardHighlight,
        animatedStyle,
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      {item.highlight && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Top pick</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.category} · ★ {item.rating.toFixed(1)}
        </Text>
      </View>
    </AnimatedPressable>
  )
})

const styles = StyleSheet.create({
  card: {
    width: 180,
    marginRight: profileTheme.spacing.md,
    borderRadius: profileTheme.radius.md,
    overflow: 'hidden',
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    shadowColor: profileTheme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHighlight: {
    borderColor: profileTheme.accent,
    shadowColor: profileTheme.accent,
    shadowOpacity: 0.35,
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: profileTheme.surfaceElevated,
  },
  badge: {
    position: 'absolute',
    top: profileTheme.spacing.sm,
    left: profileTheme.spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.accent,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: profileTheme.spacing.md,
    gap: profileTheme.spacing.xs,
  },
  name: {
    color: profileTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    color: profileTheme.textSecondary,
    fontSize: 12,
  },
})

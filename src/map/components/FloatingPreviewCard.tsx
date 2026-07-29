import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { mapTheme } from '../theme'
import type { MapPlace } from '../store/useMapStore'

type Props = {
  place: MapPlace
  distance: string
  onDismiss: () => void
  onOpenDetail: () => void
}

export const FloatingPreviewCard = memo(function FloatingPreviewCard({
  place,
  distance,
  onDismiss,
  onOpenDetail,
}: Props) {
  const handleOpen = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onOpenDetail()
  }

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(180)}
      exiting={FadeOutDown.duration(180)}
      style={styles.wrap}
    >
      <Pressable onPress={onDismiss} style={styles.dismissHit} hitSlop={12}>
        <Text style={styles.dismiss}>✕</Text>
      </Pressable>

      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.meta}>
        ★ {place.rating.toFixed(1)} · {place.category} · {distance}
      </Text>

      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>Ver más</Text>
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: mapTheme.surface,
    borderRadius: mapTheme.radius.lg,
    padding: mapTheme.spacing.lg,
    marginHorizontal: mapTheme.spacing.lg,
    borderWidth: 1,
    borderColor: mapTheme.border,
    shadowColor: mapTheme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
    gap: mapTheme.spacing.sm,
  },
  dismissHit: {
    position: 'absolute',
    top: mapTheme.spacing.md,
    right: mapTheme.spacing.md,
    zIndex: 2,
  },
  dismiss: {
    color: mapTheme.textMuted,
    fontSize: 16,
  },
  name: {
    color: mapTheme.text,
    fontSize: 18,
    fontWeight: '700',
    paddingRight: 28,
  },
  meta: {
    color: mapTheme.textSecondary,
    fontSize: 13,
  },
  cta: {
    marginTop: mapTheme.spacing.sm,
    backgroundColor: mapTheme.accent,
    borderRadius: mapTheme.radius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})

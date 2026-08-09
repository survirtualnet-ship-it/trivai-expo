import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { activityTheme } from '../theme'

type Props = {
  onConnect: () => void
  onInvite: () => void
}

export const EmptyStateFriends = memo(function EmptyStateFriends({
  onConnect,
  onInvite,
}: Props) {
  return (
    <Animated.View entering={FadeInUp.duration(420).springify()} style={styles.card}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>Conecta con tus amigos</Text>
      <Text style={styles.description}>
        Descubre dónde van tus amigos, qué guardan y dónde están en vivo para armar planes juntos.
      </Text>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onConnect()
        }}
        style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>Ver amigos</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onInvite()
        }}
        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
      >
        <Text style={styles.secondaryText}>Invitar amigos</Text>
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: activityTheme.spacing.lg,
    marginTop: activityTheme.spacing.xxl,
    padding: activityTheme.spacing.xxl,
    borderRadius: activityTheme.radius.lg,
    backgroundColor: activityTheme.surface,
    borderWidth: 1,
    borderColor: activityTheme.border,
    alignItems: 'center',
    gap: activityTheme.spacing.md,
    shadowColor: activityTheme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: activityTheme.spacing.sm,
  },
  title: {
    color: activityTheme.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: activityTheme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: activityTheme.spacing.sm,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: activityTheme.radius.full,
    backgroundColor: activityTheme.accent,
    alignItems: 'center',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: activityTheme.radius.full,
    backgroundColor: activityTheme.surfaceElevated,
    borderWidth: 1,
    borderColor: activityTheme.border,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryText: {
    color: activityTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
  },
})

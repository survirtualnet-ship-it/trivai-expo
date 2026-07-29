import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated'
import { profileTheme } from '../theme'
import type { Achievement } from '../store/useProfileStore'

type Props = {
  achievement: Achievement
  index: number
}

export const AchievementBadge = memo(function AchievementBadge({ achievement, index }: Props) {
  const progressPct = Math.min(100, (achievement.progress / achievement.total) * 100)

  return (
    <Animated.View
      entering={
        achievement.unlocked
          ? ZoomIn.delay(index * 60).springify()
          : FadeInUp.delay(index * 60).duration(350)
      }
      style={[styles.badge, achievement.unlocked && styles.badgeUnlocked]}
    >
      <Text style={styles.icon}>{achievement.icon}</Text>
      <Text style={styles.title} numberOfLines={2}>{achievement.title}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${progressPct}%` },
            achievement.unlocked && styles.fillUnlocked,
          ]}
        />
      </View>
      <Text style={styles.progress}>
        {achievement.progress}/{achievement.total}
      </Text>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  badge: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    padding: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    alignItems: 'center',
    gap: profileTheme.spacing.sm,
    marginBottom: profileTheme.spacing.md,
  },
  badgeUnlocked: {
    borderColor: profileTheme.warning,
    backgroundColor: 'rgba(245,197,66,0.08)',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    color: profileTheme.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    minHeight: 32,
  },
  track: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: profileTheme.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: profileTheme.accent,
  },
  fillUnlocked: {
    backgroundColor: profileTheme.warning,
  },
  progress: {
    color: profileTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
})

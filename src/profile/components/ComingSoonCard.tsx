import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { profileTheme } from '../theme'

type Props = {
  title: string
  body: string
  delay?: number
}

export const ComingSoonCard = memo(function ComingSoonCard({
  title,
  body,
  delay = 0,
}: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(360)}
      style={styles.card}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Pronto</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    padding: profileTheme.spacing.xl,
    borderRadius: profileTheme.radius.lg,
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.surfaceElevated,
    borderWidth: 1,
    borderColor: profileTheme.border,
  },
  badgeText: {
    color: profileTheme.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: profileTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    color: profileTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
})

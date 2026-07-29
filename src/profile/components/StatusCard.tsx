import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'

export const StatusCard = memo(function StatusCard() {
  const status = useProfileStore(s => s.currentStatus)

  return (
    <Animated.View entering={FadeInDown.delay(120).duration(420).springify()} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{status.moodEmoji}</Text>
        <View style={styles.body}>
          <Text style={styles.label}>Ahora estás en</Text>
          <Text style={styles.zone}>{status.zone}</Text>
        </View>
      </View>
      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionLabel}>Sugerencia TRIVAI</Text>
        <Text style={styles.suggestion}>{status.suggestion}</Text>
      </View>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    marginTop: profileTheme.spacing.lg,
    padding: profileTheme.spacing.xl,
    backgroundColor: profileTheme.surfaceElevated,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    gap: profileTheme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.md,
  },
  emoji: {
    fontSize: 32,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: profileTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  zone: {
    color: profileTheme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  suggestionBox: {
    padding: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(109,94,247,0.3)',
    gap: profileTheme.spacing.xs,
  },
  suggestionLabel: {
    color: profileTheme.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestion: {
    color: profileTheme.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
})

import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { companyTheme as t } from '../theme'

type Props = {
  label: string
  value: string | number
  hint?: string
  accent?: string
}

export const StatCard = memo(function StatCard({
  label,
  value,
  hint,
  accent = t.accent,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.border,
    gap: 4,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    color: t.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  hint: {
    color: t.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
})

import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'

type Props = {
  pair: string
  rate: string
  dateLabel: string
}

export const ExchangeRateCard = memo(function ExchangeRateCard({
  pair,
  rate,
  dateLabel,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="logo-usd" size={24} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.pair}>{pair}</Text>
        <Text style={styles.rate}>{rate}</Text>
      </View>
      <View style={styles.dateBadge}>
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  pair: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  rate: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: 148,
  },
  dateText: {
    flex: 1,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
})

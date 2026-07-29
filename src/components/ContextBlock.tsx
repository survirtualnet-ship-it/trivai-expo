import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'

type Props = {
  locationLine: string
  currencyLine: string
  alertLine: string
  hasAlert?: boolean
}

export const ContextBlock = memo(function ContextBlock({
  locationLine,
  currencyLine,
  alertLine,
  hasAlert = false,
}: Props) {
  return (
    <View style={[styles.card, hasAlert && styles.cardAlert]}>
      <Text style={styles.line}>{locationLine}</Text>
      <Text style={styles.currency}>{currencyLine}</Text>
      <View style={styles.divider} />
      <Text style={[styles.alert, hasAlert && styles.alertWarn]}>{alertLine}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.soft,
  },
  cardAlert: {
    backgroundColor: colors.alertBg,
  },
  line: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  currency: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  alert: {
    fontSize: fontSize.captionLg,
    fontWeight: fontWeight.regular,
    color: colors.alertOk,
  },
  alertWarn: {
    color: colors.tintRed,
    fontWeight: fontWeight.medium,
  },
})

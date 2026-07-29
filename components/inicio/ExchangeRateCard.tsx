import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { I, SP, RD, softShadow } from '@/lib/inicio/theme'
import { FONT } from '@/lib/typography'

type Props = {
  pairLabel: string
  rateLabel: string
}

export const ExchangeRateCard = memo(function ExchangeRateCard({
  pairLabel,
  rateLabel,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="swap-horizontal" size={20} color={I.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.pair}>{pairLabel}</Text>
        <Text style={styles.rate}>{rateLabel}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SP.lg,
    marginTop: SP.sm,
    backgroundColor: I.card,
    borderRadius: RD.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: I.border,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.md,
    ...softShadow,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: SP.xs,
  },
  pair: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: I.textSecondary,
    letterSpacing: 0.3,
  },
  rate: {
    fontFamily: FONT.semibold,
    fontSize: 18,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.3,
  },
})

import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Star } from 'lucide-react-native'
import { T, F } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

export type RatingSize = 'sm' | 'md'

export type RatingProps = {
  value: number
  count?: number
  size?: RatingSize
  showValue?: boolean
}

const SIZE = {
  sm: { star: 11, gap: 2, value: F.size.xs, count: F.size.xs },
  md: { star: 14, gap: 3, value: F.size.sm, count: F.size.sm },
} as const

export const Rating = memo(function Rating({
  value,
  count,
  size = 'sm',
  showValue = true,
}: RatingProps) {
  if (value <= 0) return null

  const s = SIZE[size]
  const rounded = Math.min(5, Math.max(0, Math.round(value)))

  return (
    <View style={[styles.row, { gap: s.gap }]}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={s.star}
          color={T.accent}
          fill={i <= rounded ? T.accent : 'transparent'}
        />
      ))}
      {showValue && (
        <Text style={[styles.value, { fontSize: s.value }]}>{value.toFixed(1)}</Text>
      )}
      {count != null && count > 0 && (
        <Text style={[styles.count, { fontSize: s.count }]}>({count})</Text>
      )}
    </View>
  )
})

/** Compact: single star + number (cards, lists) */
export const RatingCompact = memo(function RatingCompact({
  value,
  count,
  size = 'sm',
}: Omit<RatingProps, 'showValue'>) {
  if (value <= 0) return null
  const s = SIZE[size]

  return (
    <View style={[styles.row, { gap: s.gap }]}>
      <Star size={s.star + 1} color={T.accent} fill={T.accent} />
      <Text style={[styles.value, { fontSize: s.value }]}>{value.toFixed(1)}</Text>
      {count != null && count > 0 && (
        <Text style={[styles.count, { fontSize: s.count }]}>({count})</Text>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontFamily: FONT.semibold,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
  count: {
    fontFamily: FONT.regular,
    color: T.fg3,
  },
})

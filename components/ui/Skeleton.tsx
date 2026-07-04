import { View, StyleSheet } from 'react-native'
import { T, S, R } from '@/lib/tokens'

type Props = { height?: number; width?: number | `${number}%`; style?: object }

export function Skeleton({ height = 16, width = '100%', style }: Props) {
  return <View style={[styles.base, { height, width }, style]} />
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} width="100%" style={{ borderRadius: 0 }} />
      <View style={{ padding: S.md, gap: S.sm }}>
        <Skeleton height={14} width="70%" />
        <Skeleton height={12} width="45%" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: T.muted,
    borderRadius: R.md,
    opacity: 0.7,
  },
  card: {
    width: 260,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.surface,
  },
})

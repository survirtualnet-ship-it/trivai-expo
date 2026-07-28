import { View, StyleSheet } from 'react-native'
import { Skeleton } from '@/components/ui/Skeleton'
import { T, S, R } from '@/lib/tokens'

export function PlaceDetailSkeleton() {
  return (
    <View style={styles.root}>
      <Skeleton height={400} width="100%" style={styles.hero} />
      <View style={styles.block}>
        <Skeleton height={28} width="75%" style={styles.line} />
        <Skeleton height={16} width="40%" style={styles.line} />
        <Skeleton height={16} width="55%" style={styles.line} />
      </View>
      <View style={styles.actions}>
        <Skeleton height={72} style={styles.pill} />
        <Skeleton height={72} style={styles.pill} />
        <Skeleton height={72} style={styles.pill} />
      </View>
      <View style={styles.block}>
        <Skeleton height={18} width="30%" style={styles.line} />
        <Skeleton height={14} width="100%" style={styles.line} />
        <Skeleton height={14} width="92%" style={styles.line} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  hero: { borderRadius: 0 },
  block: {
    padding: S.lg,
    gap: S.sm,
    backgroundColor: T.surface,
    marginTop: S.sm,
  },
  line: { borderRadius: R.sm },
  actions: {
    flexDirection: 'row',
    gap: S.md,
    padding: S.lg,
    backgroundColor: T.surface,
  },
  pill: { borderRadius: R.xl, flex: 1 },
})

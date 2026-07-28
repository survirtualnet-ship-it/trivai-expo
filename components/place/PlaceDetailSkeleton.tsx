import { View, StyleSheet } from 'react-native'
import { Skeleton } from '@/components/ui/Skeleton'
import { T, S, R } from '@/lib/tokens'

export function PlaceDetailSkeleton() {
  return (
    <View style={styles.root}>
      <Skeleton height={420} width="100%" style={styles.hero} />
      <View style={styles.block}>
        <Skeleton height={34} width="78%" style={styles.line} />
        <Skeleton height={18} width="36%" style={styles.line} />
        <Skeleton height={16} width="58%" style={styles.line} />
      </View>
      <View style={styles.chips}>
        <Skeleton height={32} width={88} style={styles.chip} />
        <Skeleton height={32} width={72} style={styles.chip} />
        <Skeleton height={32} width={96} style={styles.chip} />
      </View>
      <View style={styles.block}>
        <Skeleton height={22} width="28%" style={styles.line} />
        <Skeleton height={16} width="100%" style={styles.line} />
        <Skeleton height={16} width="90%" style={styles.line} />
      </View>
      <View style={styles.actions}>
        <Skeleton height={52} width={52} style={styles.circle} />
        <Skeleton height={52} width={52} style={styles.circle} />
        <Skeleton height={52} width={52} style={styles.circle} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.surface,
  },
  hero: {
    borderRadius: 0,
  },
  block: {
    paddingHorizontal: S.lg,
    paddingTop: S.xxl,
    gap: S.md,
  },
  line: {
    borderRadius: R.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: S.sm,
    paddingHorizontal: S.lg,
    paddingTop: S.lg,
  },
  chip: {
    borderRadius: R.full,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: S.xxl,
  },
  circle: {
    borderRadius: 26,
  },
})

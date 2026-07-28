import { memo } from 'react'
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native'
import { Skeleton } from '@/components/ui/Skeleton'
import { T, S, R, SHADOW } from '@/lib/tokens'
import { PLACE_CARD_IMAGE_H, PLACE_CARD_W } from '@/lib/ui/styles'

export type SkeletonLoaderProps = {
  height?: number
  width?: number | `${number}%`
  style?: StyleProp<ViewStyle>
  borderRadius?: number
}

/** Base shimmer block */
export const SkeletonLoader = memo(function SkeletonLoader({
  height = 16,
  width = '100%',
  style,
  borderRadius = R.md,
}: SkeletonLoaderProps) {
  return (
    <Skeleton
      height={height}
      width={width}
      style={[{ borderRadius }, style]}
    />
  )
})

type PlaceCardSkeletonProps = {
  variant?: 'vertical' | 'horizontal' | 'compact'
  width?: number
}

export const PlaceCardSkeleton = memo(function PlaceCardSkeleton({
  variant = 'vertical',
  width = PLACE_CARD_W,
}: PlaceCardSkeletonProps) {
  if (variant === 'compact' || variant === 'horizontal') {
    return (
      <View style={styles.horizontal}>
        <SkeletonLoader height={variant === 'compact' ? 72 : 96} width={variant === 'compact' ? 72 : 96} borderRadius={R.lg} />
        <View style={styles.horizontalBody}>
          <SkeletonLoader height={14} width="75%" />
          <SkeletonLoader height={12} width="45%" />
          <SkeletonLoader height={12} width="55%" />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.vertical, { width }]}>
      <SkeletonLoader height={PLACE_CARD_IMAGE_H} width="100%" borderRadius={0} />
      <View style={styles.verticalBody}>
        <SkeletonLoader height={14} width="80%" />
        <SkeletonLoader height={12} width="50%" />
        <View style={styles.tagRow}>
          <SkeletonLoader height={22} width={56} borderRadius={R.full} />
          <SkeletonLoader height={22} width={48} borderRadius={R.full} />
        </View>
      </View>
    </View>
  )
})

export const SectionSkeleton = memo(function SectionSkeleton({
  cards = 3,
  cardWidth = PLACE_CARD_W,
}: {
  cards?: number
  cardWidth?: number
}) {
  return (
    <View style={styles.section}>
      <SkeletonLoader height={20} width={140} style={styles.sectionTitle} />
      <View style={styles.sectionRow}>
        {Array.from({ length: cards }).map((_, i) => (
          <PlaceCardSkeleton key={i} width={cardWidth} />
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  vertical: {
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.surface,
    ...SHADOW.sm,
  },
  verticalBody: {
    padding: S.md,
    gap: S.sm,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    padding: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    ...SHADOW.sm,
  },
  horizontalBody: {
    flex: 1,
    gap: S.sm,
  },
  tagRow: {
    flexDirection: 'row',
    gap: S.xs,
  },
  section: {
    paddingHorizontal: S.lg,
    marginBottom: S.lg,
  },
  sectionTitle: {
    marginBottom: S.md,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: S.md,
  },
})

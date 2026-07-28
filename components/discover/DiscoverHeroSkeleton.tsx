import { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Skeleton } from '@/components/ui/Skeleton'
import { HERO_H, HERO_W } from '@/components/ui/HeroCard'
import { R, SHADOW, T } from '@/lib/tokens'

export const DiscoverHeroSkeleton = memo(function DiscoverHeroSkeleton() {
  return (
    <View style={styles.wrap} accessibilityLabel="Cargando evento destacado">
      <Skeleton height={HERO_H} width="100%" style={styles.block} />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    width: HERO_W,
    height: HERO_H,
    borderRadius: R.xl,
    overflow: 'hidden',
    backgroundColor: T.surface,
    ...SHADOW.lg,
  },
  block: {
    borderRadius: R.xl,
  },
})

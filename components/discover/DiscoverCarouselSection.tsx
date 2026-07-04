import { memo, type ReactNode } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DiscoverCarouselSkeleton } from '@/components/discover/DiscoverCarouselCard'
import { S } from '@/lib/tokens'

type Props = {
  title: string
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
  children: ReactNode
}

export const DiscoverCarouselSection = memo(function DiscoverCarouselSection({
  title,
  actionLabel,
  onAction,
  loading = false,
  children,
}: Props) {
  return (
    <>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <DiscoverCarouselSkeleton />
          <DiscoverCarouselSkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {children}
        </ScrollView>
      )}
    </>
  )
})

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: S.lg,
    gap: S.md,
    paddingBottom: 4,
  },
})

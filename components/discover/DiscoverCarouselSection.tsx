import { memo, useRef, useEffect, type ReactNode } from 'react'
import { ScrollView, StyleSheet, Platform } from 'react-native'
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
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const node = scrollRef.current as unknown as { getScrollableNode?: () => HTMLElement }
    const el = node?.getScrollableNode?.()
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.classList.add('trivai-hide-scrollbar')
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.classList.remove('trivai-hide-scrollbar')
    }
  }, [loading, children])

  const carouselProps = {
    ref: scrollRef,
    horizontal: true as const,
    showsHorizontalScrollIndicator: false,
    nestedScrollEnabled: true,
    contentContainerStyle: styles.list,
    style: Platform.OS === 'web' ? styles.webScroll : undefined,
  }

  return (
    <>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      {loading ? (
        <ScrollView {...carouselProps}>
          <DiscoverCarouselSkeleton />
          <DiscoverCarouselSkeleton />
        </ScrollView>
      ) : (
        <ScrollView {...carouselProps}>
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
  webScroll: Platform.OS === 'web'
    ? ({
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexGrow: 0,
        cursor: 'grab',
      } as object)
    : {},
})

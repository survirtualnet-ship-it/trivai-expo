import { memo, useRef, useEffect, type ReactNode } from 'react'
import { ScrollView, StyleSheet, Platform } from 'react-native'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FadeInView } from '@/components/ui/FadeInView'
import { DiscoverCarouselSkeleton } from '@/components/discover/DiscoverCarouselCard'
import { S } from '@/lib/tokens'

export const DISCOVER_CAROUSEL_SKELETON_COUNT = 3

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
  const shouldAnimateSection = useRef(true)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        shouldAnimateSection.current = false
      }, 320)
      return () => clearTimeout(timer)
    }
  }, [loading])

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
    decelerationRate: 'fast' as const,
    scrollEventThrottle: 16,
    contentContainerStyle: styles.list,
    style: Platform.OS === 'web' ? styles.webScroll : undefined,
  }

  const carousel = (
    <ScrollView {...carouselProps}>
      {loading
        ? Array.from({ length: DISCOVER_CAROUSEL_SKELETON_COUNT }, (_, i) => (
            <DiscoverCarouselSkeleton key={`discover-skeleton-${i}`} />
          ))
        : children}
    </ScrollView>
  )

  return (
    <>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      <FadeInView animate={!loading && shouldAnimateSection.current} duration={280}>
        {carousel}
      </FadeInView>
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

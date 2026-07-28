import { memo, useCallback, useMemo } from 'react'
import { FlatList, StyleSheet, View, type ListRenderItemInfo } from 'react-native'
import { router } from 'expo-router'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { FadeInView, discoverItemEnterDelay } from '@/components/ui/FadeInView'
import {
  DiscoverCarouselCard,
  DiscoverCarouselSkeleton,
  DISCOVER_CAROUSEL_W,
} from '@/components/discover/DiscoverCarouselCard'
import { useDiscover } from '@/hooks/useDiscover'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/hooks/useUser'
import {
  type DiscoverFeedType,
  discoverSeeAllRoute,
} from '@/lib/discoverFeedType'
import {
  firstPhoto,
  placeBadge,
  eventBadge,
  minutesLabel,
  zoneLabel,
} from '@/lib/discoverCardUtils'
import { suggestionKey, type DiscoverSuggestion } from '@/lib/discoverSuggestions'
import { formatEventDateShort } from '@/lib/eventUtils'
import { calcIsOpen } from '@/lib/hours'
import { deferredPush } from '@/lib/deferredNav'
import { logPlaceView } from '@/lib/userActivity'
import { S } from '@/lib/tokens'
import type { AppLocale } from '@/lib/i18n/discover'
import type { EnrichedEvent, EnrichedPlace } from '@/lib/discoverFilters'

const SKELETON_ITEMS = ['a', 'b', 'c'] as const

type Props = {
  title: string
  type: DiscoverFeedType
}

export const HomeSection = memo(function HomeSection({ title, type }: Props) {
  const { locale } = useLocale()
  const { user } = useUser()
  const { suggestions, loading, prefetchFullFeed } = useDiscover({ type, mode: 'preview' })

  const handleSeeAll = useCallback(async () => {
    await prefetchFullFeed()
    const route = discoverSeeAllRoute(type)
    router.push(route)
  }, [prefetchFullFeed, type])

  const openPlace = useCallback((placeId: string) => {
    if (user?.id) logPlaceView(user.id, placeId)
    deferredPush(`/lugares/${placeId}`)
  }, [user?.id])

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<DiscoverSuggestion>) => {
    const card = item.kind === 'place'
      ? renderPlaceCard(item.data, locale, () => openPlace(item.data.id))
      : renderEventCard(item.data, locale)

    return (
      <FadeInView
        delay={discoverItemEnterDelay(index)}
        style={styles.itemWrap}
      >
        {card}
      </FadeInView>
    )
  }, [locale, openPlace])

  const keyExtractor = useCallback(
    (item: DiscoverSuggestion) => suggestionKey(item),
    [],
  )

  const skeletonData = useMemo(() => [...SKELETON_ITEMS], [])

  if (!loading && suggestions.length === 0) return null

  return (
    <View style={styles.section}>
      <SectionHeader title={title} actionLabel="Ver todo" onAction={handleSeeAll} />
      {loading ? (
        <FlatList
          horizontal
          data={skeletonData}
          keyExtractor={item => `home-skeleton-${type}-${item}`}
          renderItem={() => <DiscoverCarouselSkeleton />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      ) : (
        <FlatList
          horizontal
          data={suggestions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          initialNumToRender={5}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews
        />
      )}
    </View>
  )
})

function renderPlaceCard(
  lu: EnrichedPlace,
  locale: AppLocale,
  onPress: () => void,
) {
  return (
    <DiscoverCarouselCard
      title={lu.name}
      category={lu.category}
      locale={locale}
      photoUri={firstPhoto(lu.photos)}
      rating={lu.rating_avg ?? null}
      minutes={minutesLabel(lu, locale)}
      zone={zoneLabel(lu._zone, locale)}
      isOpen={calcIsOpen(lu.hours, lu.is_open ?? false)}
      badge={placeBadge(lu)}
      onPress={onPress}
    />
  )
}

function renderEventCard(
  ev: EnrichedEvent,
  locale: AppLocale,
) {
  return (
    <DiscoverCarouselCard
      title={ev.name}
      category={ev.category}
      locale={locale}
      photoUri={firstPhoto(ev.photos)}
      minutes={formatEventDateShort(ev.start_datetime)}
      zone={zoneLabel(ev._zone, locale)}
      isOpen={null}
      badge={eventBadge(ev)}
      onPress={() => deferredPush(`/eventos/${ev.id}`)}
    />
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: S.lg,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: S.lg,
    gap: S.md,
    paddingBottom: 4,
  },
  itemWrap: {
    width: DISCOVER_CAROUSEL_W,
  },
})

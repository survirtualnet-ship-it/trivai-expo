import { memo, useCallback, useMemo } from 'react'
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  type ListRenderItemInfo,
} from 'react-native'
import { router } from 'expo-router'
import { Section } from '@/components/ui/Section'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { PlaceCardSkeleton } from '@/components/ui/SkeletonLoader'
import { FadeInView, discoverItemEnterDelay } from '@/components/ui/FadeInView'
import { DiscoverCarouselCard } from '@/components/discover/DiscoverCarouselCard'
import { useDiscover } from '@/hooks/useDiscover'
import { useLocale } from '@/hooks/useLocale'
import { useUser } from '@/hooks/useUser'
import {
  type DiscoverFeedType,
  discoverSeeAllRoute,
} from '@/lib/discoverFeedType'
import {
  firstPhoto,
  eventBadge,
  zoneLabel,
} from '@/lib/discoverCardUtils'
import { suggestionKey, type DiscoverSuggestion } from '@/lib/discoverSuggestions'
import { formatEventDateShort } from '@/lib/eventUtils'
import { deferredPush } from '@/lib/deferredNav'
import { logPlaceView } from '@/lib/userActivity'
import { PLACE_CARD_W } from '@/lib/ui/styles'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { AppLocale } from '@/lib/i18n/discover'
import type { EnrichedEvent } from '@/lib/discoverFilters'

const SKELETON_ITEMS = ['a', 'b', 'c'] as const
const ITEM_STRIDE = PLACE_CARD_W + S.md

type Props = {
  title: string
  type: DiscoverFeedType
}

export const HomeSection = memo(function HomeSection({ title, type }: Props) {
  const { locale } = useLocale()
  const { user } = useUser()
  const { suggestions, loading, isError, refetch, prefetchFullFeed } = useDiscover({
    type,
    mode: 'preview',
  })

  const handleSeeAll = useCallback(async () => {
    await prefetchFullFeed()
    router.push(discoverSeeAllRoute(type))
  }, [prefetchFullFeed, type])

  const openPlace = useCallback((placeId: string) => {
    if (user?.id) logPlaceView(user.id, placeId)
    deferredPush(`/lugares/${placeId}`)
  }, [user?.id])

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<DiscoverSuggestion>) => {
    const card = item.kind === 'place'
      ? (
        <PlaceCard
          place={item.data}
          variant="vertical"
          width={PLACE_CARD_W}
          showHeart={false}
          showShare={false}
          locale={locale}
          onPress={() => openPlace(item.data.id)}
        />
      )
      : renderEventCard(item.data, locale)

    return (
      <FadeInView delay={discoverItemEnterDelay(index)} style={styles.itemWrap}>
        {card}
      </FadeInView>
    )
  }, [locale, openPlace])

  const keyExtractor = useCallback(
    (item: DiscoverSuggestion) => suggestionKey(item),
    [],
  )

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: ITEM_STRIDE,
    offset: S.lg + ITEM_STRIDE * index,
    index,
  }), [])

  const skeletonData = useMemo(() => [...SKELETON_ITEMS], [])

  if (isError) {
    return (
      <Section title={title}>
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorText}>No pudimos cargar esta sección</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
          >
            <Text style={styles.retry}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </Section>
    )
  }

  if (!loading && suggestions.length === 0) return null

  return (
    <Section
      title={title}
      actionLabel="Ver todo"
      onAction={handleSeeAll}
    >
      {loading ? (
        <FlatList
          horizontal
          data={skeletonData}
          keyExtractor={item => `home-skeleton-${type}-${item}`}
          renderItem={() => <PlaceCardSkeleton width={PLACE_CARD_W} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          decelerationRate="fast"
          getItemLayout={getItemLayout}
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
          decelerationRate="fast"
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={getItemLayout}
        />
      )}
    </Section>
  )
})

function renderEventCard(ev: EnrichedEvent, locale: AppLocale) {
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
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: S.lg,
    paddingBottom: 2,
  },
  itemWrap: {
    width: PLACE_CARD_W,
    marginRight: S.md,
  },
  errorBox: {
    marginHorizontal: S.lg,
    padding: S.lg,
    borderRadius: 16,
    backgroundColor: T.muted,
    alignItems: 'center',
    gap: S.sm,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    textAlign: 'center',
  },
  retry: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.primary,
  },
})

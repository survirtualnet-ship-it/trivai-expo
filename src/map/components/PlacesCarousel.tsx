import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  PlaceCard,
  MAP_PLACE_CARD_STRIDE,
  MAP_PLACE_CARD_WIDTH,
} from './PlaceCard'
import { mapTheme } from '../theme'
import { useMapStore } from '../store/useMapStore'
import { distanceLabel } from '../utils/geo'
import { getIndexById, placeLatitude, placeLongitude } from '../utils/placeHelpers'
import type { MapPlace } from '../store/useMapStore'

export const CAROUSEL_SIDE_INSET = mapTheme.spacing.lg

export type PlacesCarouselRef = {
  scrollToCard: (placeId: string) => void
}

type Props = {
  onSelect: (placeId: string) => void
  onScrollToPlace?: (placeId: string) => void
  onPressVerMas: (placeId: string) => void
}

function indexFromScrollOffset(offsetX: number, itemCount: number): number {
  if (itemCount <= 0) return 0
  const screenWidth = Dimensions.get('window').width
  const viewportCenter = offsetX + screenWidth / 2
  const raw = Math.round(
    (viewportCenter - CAROUSEL_SIDE_INSET - MAP_PLACE_CARD_WIDTH / 2)
    / MAP_PLACE_CARD_STRIDE,
  )
  return Math.max(0, Math.min(raw, itemCount - 1))
}

export const PlacesCarousel = memo(
  forwardRef<PlacesCarouselRef, Props>(function PlacesCarousel(
    { onSelect, onScrollToPlace, onPressVerMas },
    ref,
  ) {
    const places = useMapStore(s => s.displayPlaces)
    const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
    const userLocation = useMapStore(s => s.userLocation)
    const listRef = useRef<FlatList<MapPlace>>(null)

    const scrollToCard = useCallback((placeId: string) => {
      const { displayPlaces } = useMapStore.getState()
      const index = getIndexById(displayPlaces, placeId)
      if (index < 0 || !listRef.current) return

      listRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      })
    }, [])

    useImperativeHandle(ref, () => ({ scrollToCard }), [scrollToCard])

    const handleScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!onScrollToPlace || places.length === 0) return
        const offsetX = event.nativeEvent.contentOffset.x
        const index = indexFromScrollOffset(offsetX, places.length)
        const place = places[index]
        if (place) onScrollToPlace(place.id)
      },
      [onScrollToPlace, places],
    )

    const renderItem: ListRenderItem<MapPlace> = useCallback(
      ({ item }) => {
        const origin = userLocation ?? {
          lat: placeLatitude(item),
          lng: placeLongitude(item),
        }
        const distance = distanceLabel(
          placeLatitude(item),
          placeLongitude(item),
          origin.lat,
          origin.lng,
        )
        const active = item.id === selectedPlaceId

        return (
          <PlaceCard
            place={item}
            active={active}
            distance={distance}
            onPress={() => {
              void Haptics.selectionAsync()
              onSelect(item.id)
            }}
            onPressVerMas={() => onPressVerMas(item.id)}
          />
        )
      },
      [onPressVerMas, onSelect, selectedPlaceId, userLocation],
    )

    const getItemLayout = useCallback(
      (_: ArrayLike<MapPlace> | null | undefined, index: number) => ({
        length: MAP_PLACE_CARD_STRIDE,
        offset: CAROUSEL_SIDE_INSET + MAP_PLACE_CARD_STRIDE * index,
        index,
      }),
      [],
    )

    const keyExtractor = useCallback((item: MapPlace) => item.id, [])

    if (places.length === 0) return null

    return (
      <View style={styles.wrap}>
        <FlatList
          ref={listRef}
          data={places}
          extraData={selectedPlaceId}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          ListHeaderComponent={CarouselInsetSpacer}
          ListFooterComponent={CarouselInsetSpacer}
          decelerationRate="fast"
          snapToInterval={MAP_PLACE_CARD_STRIDE}
          snapToAlignment="center"
          disableIntervalMomentum
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              })
            }, 150)
          }}
        />
      </View>
    )
  }),
)

function CarouselInsetSpacer() {
  return <View style={styles.inset} />
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: mapTheme.spacing.sm,
  },
  inset: {
    width: CAROUSEL_SIDE_INSET,
  },
})

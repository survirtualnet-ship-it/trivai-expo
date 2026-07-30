import { memo, useCallback, useEffect, useRef } from 'react'
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native'
import * as Haptics from 'expo-haptics'
import { PlaceCard } from './PlaceCard'
import { mapTheme } from '../theme'
import { useMapStore } from '../store/useMapStore'
import { distanceLabel } from '../utils/geo'
import type { MapPlace } from '../store/useMapStore'

type Props = {
  places: MapPlace[]
  onSelect: (place: MapPlace) => void
  onScrollToPlace?: (place: MapPlace) => void
  onOpenDetail: (place: MapPlace) => void
}

export const PlacesCarousel = memo(function PlacesCarousel({
  places,
  onSelect,
  onScrollToPlace,
  onOpenDetail,
}: Props) {
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const userLocation = useMapStore(s => s.userLocation)
  const listRef = useRef<FlatList<MapPlace>>(null)

  useEffect(() => {
    if (!selectedPlaceId || !listRef.current) return
    const index = places.findIndex(p => p.id === selectedPlaceId)
    if (index >= 0) {
      listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
    }
  }, [selectedPlaceId, places])

  const renderItem: ListRenderItem<MapPlace> = useCallback(({ item }) => {
    const origin = userLocation ?? { lat: item.lat, lng: item.lng }
    const distance = distanceLabel(item.lat, item.lng, origin.lat, origin.lng)
    return (
      <PlaceCard
        place={item}
        active={item.id === selectedPlaceId}
        distance={distance}
        onPress={() => {
          void Haptics.selectionAsync()
          onSelect(item)
        }}
        onPressVerMas={() => onOpenDetail(item)}
      />
    )
  }, [onOpenDetail, onSelect, selectedPlaceId, userLocation])

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: MapPlace }[] }) => {
      const first = viewableItems[0]?.item
      if (first && onScrollToPlace) onScrollToPlace(first)
    },
  ).current

  if (places.length === 0) return null

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={places}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: true })
          }, 100)
        }}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: mapTheme.spacing.sm,
  },
  list: {
    paddingHorizontal: mapTheme.spacing.lg,
  },
})

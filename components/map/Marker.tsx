import { memo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Marker } from 'react-native-maps'
import { getCatColor } from '@/lib/categories'
import type { ExplorerMapMarker } from '@/lib/explorerMapHtml'

type Props = {
  marker: ExplorerMapMarker
  selected?: boolean
  onPress?: (id: string) => void
}

export const PlaceMarker = memo(function PlaceMarker({ marker, selected, onPress }: Props) {
  const color = getCatColor(marker.category)

  return (
    <Marker
      coordinate={{ latitude: marker.lat, longitude: marker.lng }}
      title={marker.name}
      zIndex={selected ? 999 : 1}
      onPress={() => onPress?.(marker.id)}
    >
      <View style={[
        styles.dot,
        { backgroundColor: color, borderWidth: selected ? 3 : 2 },
        selected && styles.dotSelected,
      ]} />
    </Marker>
  )
})

const styles = StyleSheet.create({
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: '#fff',
  },
  dotSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
})

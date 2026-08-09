import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { MapViewExplorer } from '@/components/map/MapView.web'
import type { ExplorePlace } from '@/lib/explore/types'

type Props = {
  places: ExplorePlace[]
  selectedId: string | null
  userCoords: { latitude: number; longitude: number } | null
  onMarkerPress: (id: string) => void
}

function ExploreMapWeb({
  places,
  selectedId,
  userCoords,
  onMarkerPress,
}: Props) {
  const first = places[0]
  const center = {
    lat: userCoords?.latitude ?? first?.latitude ?? 0,
    lng: userCoords?.longitude ?? first?.longitude ?? 0,
  }

  const markers = places.map(p => ({
    id: p.id,
    name: p.name,
    category: p.categoryLabel,
    lat: p.latitude,
    lng: p.longitude,
  }))

  return (
    <View style={styles.fill}>
      <MapViewExplorer
        markers={markers}
        center={center}
        selectedId={selectedId}
        userLocation={userCoords ? { lat: userCoords.latitude, lng: userCoords.longitude } : null}
        onMarkerPress={onMarkerPress}
      />
    </View>
  )
}

export const ExploreMap = memo(ExploreMapWeb)

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
})

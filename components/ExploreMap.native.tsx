import { memo, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import type { ExplorePlace } from '@/lib/explore/types'

type Props = {
  places: ExplorePlace[]
  selectedId: string | null
  userCoords: { latitude: number; longitude: number } | null
  onMarkerPress: (id: string) => void
}

const FALLBACK = {
  latitude: -17.7833,
  longitude: -63.1821,
}

function ExploreMapNative({
  places,
  selectedId,
  userCoords,
  onMarkerPress,
}: Props) {
  const mapRef = useRef<MapView>(null)
  const center = userCoords ?? FALLBACK

  const initialRegion = useMemo((): Region => ({
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }), [center.latitude, center.longitude])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const place = places.find(p => p.id === selectedId)
    if (!place) return
    mapRef.current.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.018,
      longitudeDelta: 0.018,
    }, 380)
  }, [selectedId, places])

  return (
    <MapView
      ref={mapRef}
      style={styles.fill}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
    >
      {places.map(place => {
        const selected = place.id === selectedId
        return (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            onPress={() => onMarkerPress(place.id)}
            zIndex={selected ? 999 : 1}
          >
            <View style={[styles.pin, selected && styles.pinSelected]}>
              <View style={[styles.pinDot, selected && styles.pinDotSelected]} />
            </View>
          </Marker>
        )
      })}
    </MapView>
  )
}

export const ExploreMap = memo(ExploreMapNative)

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(17,17,17,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSelected: {
    backgroundColor: 'rgba(17,17,17,0.2)',
    transform: [{ scale: 1.15 }],
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinDotSelected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6C4CF1',
  },
})

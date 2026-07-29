import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import { PlaceMarker } from '@/components/map/Marker'
import type { ExplorerMapMarker } from '@/lib/explorerMapHtml'
import type { Coords } from '@/lib/geolocation'
import type { MapRegion } from '@/components/map/types'

export type { MapRegion }

type Props = {
  markers: ExplorerMapMarker[]
  center: Coords
  selectedId?: string | null
  userLocation?: Coords | null
  onMarkerPress?: (id: string) => void
  onRegionChange?: (region: MapRegion) => void
}

const DEFAULT_DELTA = 0.045

function ExplorerMapViewNative({
  markers,
  center,
  selectedId,
  userLocation,
  onMarkerPress,
  onRegionChange,
}: Props) {
  const mapRef = useRef<MapView>(null)
  const regionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initialRegion = useMemo((): Region => ({
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
  }), [center.lat, center.lng])

  useEffect(() => {
    if (!selectedId || !mapRef.current) return
    const m = markers.find(x => x.id === selectedId)
    if (!m) return
    mapRef.current.animateToRegion({
      latitude: m.lat,
      longitude: m.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 350)
  }, [selectedId, markers])

  useEffect(() => {
    if (selectedId) return
    mapRef.current?.animateToRegion({
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    }, 300)
  }, [center.lat, center.lng, selectedId])

  const handleRegionChangeComplete = useCallback((region: Region) => {
    if (regionTimer.current) clearTimeout(regionTimer.current)
    regionTimer.current = setTimeout(() => {
      const latDelta = region.latitudeDelta / 2
      const lngDelta = region.longitudeDelta / 2
      onRegionChange?.({
        center: { lat: region.latitude, lng: region.longitude },
        bounds: {
          ne: { lat: region.latitude + latDelta, lng: region.longitude + lngDelta },
          sw: { lat: region.latitude - latDelta, lng: region.longitude - lngDelta },
        },
      })
    }, 400)
  }, [onRegionChange])

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        style={styles.fill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {markers.slice(0, 120).map(m => (
          <PlaceMarker
            key={m.id}
            marker={m}
            selected={m.id === selectedId}
            onPress={onMarkerPress}
          />
        ))}
      </MapView>
    </View>
  )
}

export const MapViewExplorer = memo(ExplorerMapViewNative)

const styles = StyleSheet.create({
  fill: { flex: 1 },
})

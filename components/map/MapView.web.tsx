import { memo, useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { MapEmbed } from '@/components/MapEmbed'
import { buildExplorerMapHtml } from '@/lib/explorerMapHtml'
import type { ExplorerMapMarker } from '@/lib/explorerMapHtml'
import type { Coords } from '@/lib/geolocation'
import type { MapRegion } from '@/components/map/MapView.native'

type Props = {
  markers: ExplorerMapMarker[]
  center: Coords
  selectedId?: string | null
  userLocation?: Coords | null
  onMarkerPress?: (id: string) => void
  onRegionChange?: (region: MapRegion) => void
}

function ExplorerMapViewWeb({
  markers,
  center,
  selectedId,
  userLocation,
  onMarkerPress,
  onRegionChange,
}: Props) {
  const html = useMemo(
    () => buildExplorerMapHtml(markers, center, selectedId, userLocation),
    [markers, center, selectedId, userLocation],
  )

  const handleMessage = (raw: string) => {
    try {
      const data = JSON.parse(raw) as { type?: string; id?: string; center?: Coords; bounds?: MapRegion['bounds'] }
      if (data.type === 'marker' && data.id) onMarkerPress?.(data.id)
      if (data.type === 'region' && data.center && data.bounds) {
        onRegionChange?.({ center: data.center, bounds: data.bounds })
      }
    } catch {
      // legacy marker payload
      try {
        const m = JSON.parse(raw) as { id?: string }
        if (m.id) onMarkerPress?.(m.id)
      } catch { /* ignore */ }
    }
  }

  return (
    <View style={styles.fill}>
      <MapEmbed html={html} onMessage={handleMessage} />
    </View>
  )
}

export const MapViewExplorer = memo(ExplorerMapViewWeb)

const styles = StyleSheet.create({
  fill: { flex: 1 },
})

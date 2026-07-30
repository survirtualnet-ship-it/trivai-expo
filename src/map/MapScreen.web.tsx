import { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { MapEmbed } from '@/components/MapEmbed'
import { deferredPush } from '@/lib/deferredNav'
import { useLocation } from '@/hooks/useLocation'
import { SearchBar } from './components/SearchBar'
import { FilterChips } from './components/FilterChips'
import { MapControls } from './components/MapControls'
import { PlacesCarousel } from './components/PlacesCarousel'
import {
  useVisiblePlaces,
} from './hooks/useVisiblePlaces'
import { useMapStore } from './store/useMapStore'
import { buildDiscoveryMapHtml } from './utils/mapWebHtml'
import { mapTheme } from './theme'
import { MAP_CITY_CENTER } from './data/mockPlaces'
import type { MapPlace } from './store/useMapStore'

/** Web fallback — react-native-maps is native-only. */
export function MapScreen() {
  const insets = useSafeAreaInsets()
  const tabBarClearance = 72 + insets.bottom

  const visiblePlaces = useVisiblePlaces()
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const filtersVisible = useMapStore(s => s.filtersVisible)
  const userLocation = useMapStore(s => s.userLocation)
  const setUserLocation = useMapStore(s => s.setUserLocation)
  const setSelectedPlaceId = useMapStore(s => s.setSelectedPlaceId)
  const toggleFilters = useMapStore(s => s.toggleFilters)

  const { coords } = useLocation({ watch: false, enabled: true })

  useEffect(() => {
    if (coords) setUserLocation({ lat: coords.lat, lng: coords.lng })
  }, [coords, setUserLocation])

  const html = useMemo(
    () =>
      buildDiscoveryMapHtml(
        visiblePlaces,
        selectedPlaceId,
        userLocation ?? coords ?? MAP_CITY_CENTER,
      ),
    [visiblePlaces, selectedPlaceId, userLocation, coords],
  )

  const handleMapMessage = useCallback(
    (raw: string) => {
      try {
        const data = JSON.parse(raw) as { type?: string; id?: string }
        if (data.type === 'marker' && data.id) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          setSelectedPlaceId(data.id)
        }
      } catch {
        /* ignore malformed messages */
      }
    },
    [setSelectedPlaceId],
  )

  const handleCarouselSelect = useCallback(
    (place: MapPlace) => setSelectedPlaceId(place.id),
    [setSelectedPlaceId],
  )

  const handleOpenDetail = useCallback((place: MapPlace) => {
    deferredPush({ pathname: '/lugares/[id]', params: { id: place.id } })
  }, [])

  return (
    <View style={styles.root}>
      <MapEmbed html={html} onMessage={handleMapMessage} />

      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topStack} pointerEvents="box-none">
          <SearchBar />
          <FilterChips />
        </View>
      </SafeAreaView>

      <View style={styles.controlsWrap} pointerEvents="box-none">
        <MapControls
          onCenterUser={() => {}}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onToggleFilters={toggleFilters}
          filtersVisible={filtersVisible}
        />
      </View>

      <View style={[styles.bottomOverlay, { bottom: tabBarClearance }]} pointerEvents="box-none">
        <PlacesCarousel
          places={visiblePlaces}
          onSelect={handleCarouselSelect}
          onOpenDetail={handleOpenDetail}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: mapTheme.bg,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topStack: {
    paddingTop: mapTheme.spacing.sm,
    gap: mapTheme.spacing.md,
  },
  controlsWrap: {
    position: 'absolute',
    right: mapTheme.spacing.lg,
    top: '38%',
    zIndex: 8,
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: mapTheme.spacing.md,
    zIndex: 9,
  },
})

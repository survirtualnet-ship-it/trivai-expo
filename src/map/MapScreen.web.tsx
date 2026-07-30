import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { MapEmbed } from '@/components/MapEmbed'
import { deferredPush } from '@/lib/deferredNav'
import { useLocation } from '@/hooks/useLocation'
import { SearchBar } from './components/SearchBar'
import { FilterChips } from './components/FilterChips'
import { MapControls } from './components/MapControls'
import { PlacesCarousel, type PlacesCarouselRef } from './components/PlacesCarousel'
import { useMapSync } from './hooks/useMapSync'
import { useMapStore } from './store/useMapStore'
import { buildDiscoveryMapHtml } from './utils/mapWebHtml'
import { mapTheme } from './theme'
import { MAP_CITY_CENTER } from './data/mockPlaces'

/** Web fallback — react-native-maps is native-only. */
export function MapScreen() {
  const carouselRef = useRef<PlacesCarouselRef>(null)
  const insets = useSafeAreaInsets()
  const tabBarClearance = 72 + insets.bottom

  const displayPlaces = useMapStore(s => s.displayPlaces)
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const activeFilter = useMapStore(s => s.activeFilter)
  const filtersVisible = useMapStore(s => s.filtersVisible)
  const userLocation = useMapStore(s => s.userLocation)
  const setUserLocation = useMapStore(s => s.setUserLocation)
  const toggleFilters = useMapStore(s => s.toggleFilters)

  const { coords } = useLocation({ watch: false, enabled: true })

  useEffect(() => {
    if (coords) setUserLocation({ lat: coords.lat, lng: coords.lng })
  }, [coords, setUserLocation])

  const mapCenter = userLocation ?? coords ?? MAP_CITY_CENTER

  const html = useMemo(
    () => buildDiscoveryMapHtml(displayPlaces, selectedPlaceId, mapCenter),
    [displayPlaces, mapCenter],
  )

  const mapKey = useMemo(
    () => `${activeFilter}:${displayPlaces.map(p => p.id).join(',')}`,
    [activeFilter, displayPlaces],
  )

  const {
    selectFromMarker,
    selectFromCard,
    selectFromVerMas,
    selectFromCarouselScroll,
  } = useMapSync({ carouselRef })

  const handleMapMessage = useCallback(
    (raw: string) => {
      try {
        const data = JSON.parse(raw) as { type?: string; id?: string }
        if (data.type === 'marker' && data.id) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          selectFromMarker(data.id)
        }
      } catch {
        /* ignore malformed messages */
      }
    },
    [selectFromMarker],
  )

  const handleCardPress = useCallback(
    (placeId: string) => {
      selectFromCard(placeId)
    },
    [selectFromCard],
  )

  const handleCarouselScroll = useCallback(
    (placeId: string) => {
      selectFromCarouselScroll(placeId)
    },
    [selectFromCarouselScroll],
  )

  const handleVerMas = useCallback(
    (placeId: string) => {
      selectFromVerMas(placeId)
      deferredPush(`/lugares/${placeId}`)
    },
    [selectFromVerMas],
  )

  return (
    <View style={styles.root}>
      <MapEmbed
        html={html}
        mapKey={mapKey}
        selectedPlaceId={selectedPlaceId}
        onMessage={handleMapMessage}
      />

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
          ref={carouselRef}
          onSelect={handleCardPress}
          onScrollToPlace={handleCarouselScroll}
          onPressVerMas={handleVerMas}
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

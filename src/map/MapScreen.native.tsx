import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { deferredPush } from '@/lib/deferredNav'
import { useLocation } from '@/hooks/useLocation'
import { MapMarker } from './components/MapMarker'
import { SearchBar } from './components/SearchBar'
import { FilterChips } from './components/FilterChips'
import { MapControls } from './components/MapControls'
import { PlacesCarousel } from './components/PlacesCarousel'
import {
  useVisiblePlaces,
} from './hooks/useVisiblePlaces'
import { useMapStore, DEFAULT_REGION } from './store/useMapStore'
import { MAP_DARK_STYLE } from './mapDarkStyle'
import { mapTheme } from './theme'
import { MAP_CITY_CENTER } from '../data/mockPlaces'
import type { MapPlace } from './store/useMapStore'

const INITIAL_REGION: Region = {
  latitude: DEFAULT_REGION.lat,
  longitude: DEFAULT_REGION.lng,
  latitudeDelta: DEFAULT_REGION.latDelta,
  longitudeDelta: DEFAULT_REGION.lngDelta,
}

export function MapScreen() {
  const mapRef = useRef<MapView>(null)
  const carouselScrollRef = useRef(false)
  const insets = useSafeAreaInsets()
  const tabBarClearance = 72 + insets.bottom

  const visiblePlaces = useVisiblePlaces()
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const filtersVisible = useMapStore(s => s.filtersVisible)
  const region = useMapStore(s => s.region)
  const setRegion = useMapStore(s => s.setRegion)
  const setUserLocation = useMapStore(s => s.setUserLocation)
  const setSelectedPlaceId = useMapStore(s => s.setSelectedPlaceId)
  const dismissPreview = useMapStore(s => s.dismissPreview)
  const toggleFilters = useMapStore(s => s.toggleFilters)

  const { coords } = useLocation({ watch: false, enabled: true })

  useEffect(() => {
    if (coords) setUserLocation({ lat: coords.lat, lng: coords.lng })
  }, [coords, setUserLocation])

  const animateToPlace = useCallback((place: Pick<MapPlace, 'lat' | 'lng'>) => {
    mapRef.current?.animateToRegion(
      {
        latitude: place.lat,
        longitude: place.lng,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      350,
    )
  }, [])

  const handleMarkerPress = useCallback(
    (id: string) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      carouselScrollRef.current = true
      setSelectedPlaceId(id)
      const place = visiblePlaces.find(p => p.id === id)
      if (place) animateToPlace(place)
      setTimeout(() => {
        carouselScrollRef.current = false
      }, 400)
    },
    [animateToPlace, setSelectedPlaceId, visiblePlaces],
  )

  const handleCarouselSelect = useCallback(
    (place: MapPlace) => {
      carouselScrollRef.current = true
      setSelectedPlaceId(place.id)
      animateToPlace(place)
      setTimeout(() => {
        carouselScrollRef.current = false
      }, 400)
    },
    [animateToPlace, setSelectedPlaceId],
  )

  const handleCarouselScroll = useCallback(
    (place: MapPlace) => {
      if (carouselScrollRef.current) return
      if (place.id === selectedPlaceId) return
      setSelectedPlaceId(place.id)
      animateToPlace(place)
    },
    [animateToPlace, selectedPlaceId, setSelectedPlaceId],
  )

  const handleCenterUser = useCallback(() => {
    const loc = coords ?? MAP_CITY_CENTER
    mapRef.current?.animateToRegion(
      {
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      400,
    )
  }, [coords])

  const handleZoom = useCallback(
    (direction: 'in' | 'out') => {
      const factor = direction === 'in' ? 0.5 : 2
      mapRef.current?.animateToRegion(
        {
          latitude: region.lat,
          longitude: region.lng,
          latitudeDelta: Math.max(0.002, Math.min(0.2, region.latDelta * factor)),
          longitudeDelta: Math.max(0.002, Math.min(0.2, region.lngDelta * factor)),
        },
        250,
      )
    },
    [region],
  )

  const handleOpenDetail = useCallback((place: MapPlace) => {
    deferredPush({ pathname: '/lugares/[id]', params: { id: place.id } })
  }, [])

  const onRegionChangeComplete = useCallback(
    (r: Region) => {
      setRegion({
        lat: r.latitude,
        lng: r.longitude,
        latDelta: r.latitudeDelta,
        lngDelta: r.longitudeDelta,
      })
    },
    [setRegion],
  )

  const markers = useMemo(
    () =>
      visiblePlaces.map(place => (
        <MapMarker
          key={place.id}
          place={place}
          selected={place.id === selectedPlaceId}
          onPress={handleMarkerPress}
        />
      )),
    [handleMarkerPress, selectedPlaceId, visiblePlaces],
  )

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={[...MAP_DARK_STYLE]}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={dismissPreview}
      >
        {markers}
      </MapView>

      <SafeAreaView style={styles.topOverlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.topStack} pointerEvents="box-none">
          <SearchBar />
          <FilterChips />
        </View>
      </SafeAreaView>

      <View style={styles.controlsWrap} pointerEvents="box-none">
        <MapControls
          onCenterUser={handleCenterUser}
          onZoomIn={() => handleZoom('in')}
          onZoomOut={() => handleZoom('out')}
          onToggleFilters={toggleFilters}
          filtersVisible={filtersVisible}
        />
      </View>

      <View style={[styles.bottomOverlay, { bottom: tabBarClearance }]} pointerEvents="box-none">
        <PlacesCarousel
          places={visiblePlaces}
          onSelect={handleCarouselSelect}
          onScrollToPlace={handleCarouselScroll}
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

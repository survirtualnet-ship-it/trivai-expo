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

import { PlacesCarousel, type PlacesCarouselRef } from './components/PlacesCarousel'

import { useMapSync } from './hooks/useMapSync'

import { useMapPlaces } from './hooks/useMapPlaces'

import { useMapInitialSelection } from './hooks/useMapInitialSelection'

import { useMapStore, DEFAULT_REGION } from './store/useMapStore'

import { MAP_LIGHT_STYLE } from './mapDarkStyle'

import { mapTheme } from './theme'

const INITIAL_REGION: Region = {

  latitude: DEFAULT_REGION.lat,

  longitude: DEFAULT_REGION.lng,

  latitudeDelta: DEFAULT_REGION.latDelta,

  longitudeDelta: DEFAULT_REGION.lngDelta,

}



export function MapScreen() {

  const mapRef = useRef<MapView>(null)

  const carouselRef = useRef<PlacesCarouselRef>(null)

  const insets = useSafeAreaInsets()

  const tabBarClearance = 72 + insets.bottom



  const { loading: placesLoading } = useMapPlaces()



  const displayPlaces = useMapStore(s => s.displayPlaces)

  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)

  const filtersVisible = useMapStore(s => s.filtersVisible)

  const region = useMapStore(s => s.region)

  const setRegion = useMapStore(s => s.setRegion)

  const setUserLocation = useMapStore(s => s.setUserLocation)

  const dismissPreview = useMapStore(s => s.dismissPreview)

  const toggleFilters = useMapStore(s => s.toggleFilters)



  const {

    selectFromMarker,

    selectFromCard,

    selectFromVerMas,

    selectFromCarouselScroll,

  } = useMapSync({ mapRef, carouselRef })



  const { coords } = useLocation({ watch: false, enabled: true })



  useEffect(() => {

    if (coords) setUserLocation({ lat: coords.lat, lng: coords.lng })

  }, [coords, setUserLocation])



  useMapInitialSelection(carouselRef, placesLoading)



  const handleMarkerPress = useCallback(

    (id: string) => {

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      selectFromMarker(id)

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



  const handleCenterUser = useCallback(() => {

    if (!coords) return

    mapRef.current?.animateToRegion(

      {

        latitude: coords.lat,

        longitude: coords.lng,

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

      displayPlaces.map(place => (

        <MapMarker

          key={place.id}

          place={place}

          selected={place.id === selectedPlaceId}

          onPress={handleMarkerPress}

        />

      )),

    [displayPlaces, handleMarkerPress, selectedPlaceId],

  )



  return (

    <View style={styles.root}>

      <MapView

        ref={mapRef}

        style={StyleSheet.absoluteFill}

        provider={PROVIDER_GOOGLE}

        customMapStyle={[...MAP_LIGHT_STYLE]}

        initialRegion={INITIAL_REGION}

        showsUserLocation

        showsMyLocationButton={false}

        onRegionChangeComplete={onRegionChangeComplete}

        onPress={e => {

          if (e.nativeEvent.action === 'marker-press') return

          dismissPreview()

        }}

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



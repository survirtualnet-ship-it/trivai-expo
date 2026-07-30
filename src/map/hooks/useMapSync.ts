import { useCallback, useEffect, useRef } from 'react'
import type MapView from 'react-native-maps'
import { useMapStore } from '../store/useMapStore'
import type { PlacesCarouselRef } from '../components/PlacesCarousel'
import { placeLatitude, placeLongitude } from '../utils/placeHelpers'

const MAP_ZOOM = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
}

const MAP_ANIM_MS = 350
const CAROUSEL_LOCK_MS = 800

type Options = {
  mapRef?: React.RefObject<MapView | null>
  carouselRef: React.RefObject<PlacesCarouselRef | null>
  /** Web: pan map via postMessage instead of native MapView */
  onAnimateMap?: (placeId: string) => void
}

export function useMapSync({ mapRef, carouselRef, onAnimateMap }: Options) {
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const displayPlaces = useMapStore(s => s.displayPlaces)
  const setSelectedPlace = useMapStore(s => s.setSelectedPlace)

  const carouselLockRef = useRef(false)
  const mapLockRef = useRef(false)

  const resolvePlace = useCallback((id: string) => {
    const { displayPlaces } = useMapStore.getState()
    return displayPlaces.find(p => p.id === id)
  }, [])

  const animateMapToId = useCallback(
    (id: string) => {
      const place = resolvePlace(id)
      if (!place) return

      if (mapLockRef.current) return
      mapLockRef.current = true

      const region = {
        latitude: placeLatitude(place),
        longitude: placeLongitude(place),
        ...MAP_ZOOM,
      }

      if (mapRef?.current) {
        mapRef.current.animateToRegion(region, MAP_ANIM_MS)
      } else {
        onAnimateMap?.(id)
      }

      setTimeout(() => {
        mapLockRef.current = false
      }, MAP_ANIM_MS + 80)
    },
    [mapRef, onAnimateMap, resolvePlace],
  )

  const scrollCarouselToId = useCallback(
    (id: string) => {
      carouselLockRef.current = true
      carouselRef.current?.scrollToCard(id)
      setTimeout(() => {
        carouselLockRef.current = false
      }, CAROUSEL_LOCK_MS)
    },
    [carouselRef],
  )

  /** Marker tapped */
  const selectFromMarker = useCallback(
    (id: string) => {
      if (!resolvePlace(id)) return
      setSelectedPlace(id)
      scrollCarouselToId(id)
      animateMapToId(id)
    },
    [animateMapToId, resolvePlace, scrollCarouselToId, setSelectedPlace],
  )

  /** Card body tapped */
  const selectFromCard = useCallback(
    (id: string) => {
      if (!resolvePlace(id)) return
      setSelectedPlace(id)
      animateMapToId(id)
    },
    [animateMapToId, resolvePlace, setSelectedPlace],
  )

  /** Carousel scroll settled */
  const selectFromCarouselScroll = useCallback(
    (id: string) => {
      if (carouselLockRef.current) return
      if (id === selectedPlaceId) return
      if (!resolvePlace(id)) return
      setSelectedPlace(id)
      animateMapToId(id)
    },
    [animateMapToId, resolvePlace, selectedPlaceId, setSelectedPlace],
  )

  /** Ver más — sync then caller navigates with same id */
  const selectFromVerMas = useCallback(
    (id: string) => {
      if (!resolvePlace(id)) return
      setSelectedPlace(id)
      scrollCarouselToId(id)
      animateMapToId(id)
    },
    [animateMapToId, resolvePlace, scrollCarouselToId, setSelectedPlace],
  )

  useEffect(() => {
    if (!selectedPlaceId) return
    if (displayPlaces.some(p => p.id === selectedPlaceId)) return
    setSelectedPlace(null)
  }, [displayPlaces, selectedPlaceId, setSelectedPlace])

  return {
    selectedPlaceId,
    selectFromMarker,
    selectFromCard,
    selectFromVerMas,
    selectFromCarouselScroll,
  }
}

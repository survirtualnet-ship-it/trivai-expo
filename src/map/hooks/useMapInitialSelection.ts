import { useEffect } from 'react'
import { useMapStore } from '../store/useMapStore'
import type { PlacesCarouselRef } from '../components/PlacesCarousel'

/** Select first visible place when filter/data changes and nothing is selected. */
export function useMapInitialSelection(
  carouselRef: React.RefObject<PlacesCarouselRef | null>,
  placesLoading: boolean,
) {
  const displayPlaces = useMapStore(s => s.displayPlaces)
  const selectedPlaceId = useMapStore(s => s.selectedPlaceId)
  const setSelectedPlace = useMapStore(s => s.setSelectedPlace)

  useEffect(() => {
    if (placesLoading || displayPlaces.length === 0) return

    const stillValid =
      selectedPlaceId != null
      && displayPlaces.some(p => p.id === selectedPlaceId)

    if (stillValid) return

    const firstId = displayPlaces[0].id
    setSelectedPlace(firstId)
    requestAnimationFrame(() => {
      carouselRef.current?.scrollToCard(firstId)
    })
  }, [
    placesLoading,
    displayPlaces,
    selectedPlaceId,
    setSelectedPlace,
    carouselRef,
  ])
}

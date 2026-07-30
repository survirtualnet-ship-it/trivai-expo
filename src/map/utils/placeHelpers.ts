import type { MapPlace } from '../store/useMapStore'

/** Resolve index by unique id — never guess from scroll position alone. */
export function getIndexById(places: MapPlace[], id: string): number {
  return places.findIndex(p => p.id === id)
}

export function placeLatitude(place: MapPlace): number {
  return place.latitude ?? place.lat
}

export function placeLongitude(place: MapPlace): number {
  return place.longitude ?? place.lng
}

export function placeImage(place: MapPlace): string {
  return place.image ?? place.imageUrl
}

/** Keep lat/lng/imageUrl in sync with canonical latitude/longitude/image fields. */
export function normalizeMapPlace(
  raw: MapPlace | (Omit<MapPlace, 'latitude' | 'longitude' | 'image' | 'lat' | 'lng' | 'imageUrl'> & {
    lat?: number
    lng?: number
    latitude?: number
    longitude?: number
    imageUrl?: string
    image?: string
  }),
): MapPlace {
  const latitude = raw.latitude ?? raw.lat ?? 0
  const longitude = raw.longitude ?? raw.lng ?? 0
  const image = raw.image ?? raw.imageUrl ?? ''
  return {
    ...raw,
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    image,
    imageUrl: image,
  }
}

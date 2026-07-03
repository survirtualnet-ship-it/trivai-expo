import * as Location from 'expo-location'
import { Platform } from 'react-native'

export type Coords = { lat: number; lng: number }

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  return status === 'granted'
}

/** Ubicación actual — expo-location en nativo, navigator en web como fallback */
export async function getCurrentCoords(): Promise<Coords | null> {
  try {
    const granted = await requestLocationPermission()
    if (!granted) return webGeolocationFallback()
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
    return { lat: pos.coords.latitude, lng: pos.coords.longitude }
  } catch {
    return webGeolocationFallback()
  }
}

function webGeolocationFallback(): Promise<Coords | null> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null)
  }
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    )
  })
}

/** Convierte dirección + ciudad en coordenadas */
export async function geocodeAddress(address: string, city: string): Promise<Coords | null> {
  const query = `${address.trim()}, ${city.trim()}, Bolivia`

  if (Platform.OS !== 'web') {
    try {
      const results = await Location.geocodeAsync(query)
      if (results[0]) {
        return { lat: results[0].latitude, lng: results[0].longitude }
      }
    } catch {
      // fallback a Google Geocoding
    }
  }

  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
  if (!key) return null

  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url)
    const data = await res.json()
    const loc = data.results?.[0]?.geometry?.location
    if (loc) return { lat: loc.lat, lng: loc.lng }
  } catch {
    // sin coords
  }
  return null
}

/** Manual → geocoding de dirección → ubicación actual */
export async function resolvePlaceCoords(
  address: string,
  city: string,
  manual: Coords | null,
): Promise<Coords | null> {
  if (manual) return manual
  return (await geocodeAddress(address, city)) ?? (await getCurrentCoords())
}

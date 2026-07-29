import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { Platform } from 'react-native'
import { getCurrentCoords, requestLocationPermission, type Coords } from '@/lib/geolocation'
import { DEFAULT_COORDS, LOCATION_WATCH_INTERVAL_MS } from '@/lib/constants'

export type LocationState = {
  coords: Coords | null
  latitude: number
  longitude: number
  permission: 'undetermined' | 'granted' | 'denied'
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * GPS location with permission + periodic refresh.
 */
export function useLocation(options?: {
  watch?: boolean
  intervalMs?: number
  /** When false, skip GPS entirely (legacy callers). Default true. */
  enabled?: boolean
}): LocationState {
  const watch = options?.watch ?? true
  const enabled = options?.enabled ?? true
  const intervalMs = options?.intervalMs ?? LOCATION_WATCH_INTERVAL_MS

  const [coords, setCoords] = useState<Coords | null>(null)
  const [permission, setPermission] = useState<'undetermined' | 'granted' | 'denied'>('undetermined')
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const granted = await requestLocationPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (!granted) {
        setCoords(null)
        setError('Location permission denied')
        return
      }
      const next = await getCurrentCoords()
      setCoords(next)
      if (!next) setError('Could not resolve location')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Location error')
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }
    void refresh()
  }, [enabled, refresh])

  useEffect(() => {
    if (!enabled || !watch) return
    timerRef.current = setInterval(() => { void refresh() }, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [enabled, watch, intervalMs, refresh])

  // Native watchPosition for smoother updates when available
  useEffect(() => {
    if (!enabled || !watch || Platform.OS === 'web') return
    let sub: Location.LocationSubscription | null = null
    let cancelled = false

    ;(async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync()
        if (status !== 'granted' || cancelled) return
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: intervalMs,
            distanceInterval: 80,
          },
          pos => {
            setCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            })
            setPermission('granted')
            setIsLoading(false)
          },
        )
      } catch {
        // periodic refresh fallback already running
      }
    })()

    return () => {
      cancelled = true
      sub?.remove()
    }
  }, [enabled, watch, intervalMs])

  const latitude = coords?.lat ?? DEFAULT_COORDS.latitude
  const longitude = coords?.lng ?? DEFAULT_COORDS.longitude

  return {
    coords,
    latitude,
    longitude,
    permission,
    isLoading,
    error,
    refresh,
  }
}

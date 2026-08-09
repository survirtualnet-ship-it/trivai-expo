import { haversineKm } from './eventUtils'
import type { Coords } from '@/lib/geolocation'

/** Radio en km para considerar un lugar en el Centro (relativo al origen del usuario). */
const CENTRO_RADIUS_KM = 2.5

export type CityZone = 'Centro' | 'Norte' | 'Sur' | 'Este' | 'Oeste'

export const CITY_ZONES: CityZone[] = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste']

/**
 * Zona cardinal respecto al origen del usuario (GPS / mapa).
 * Sin origen no hay zona fija de ciudad.
 */
export function getCityZone(
  lat: number,
  lng: number,
  origin?: Coords | null,
): CityZone | null {
  if (!origin) return null

  const dist = haversineKm(origin.lat, origin.lng, lat, lng)
  if (dist <= CENTRO_RADIUS_KM) return 'Centro'

  const latDiff = lat - origin.lat
  const lngDiff = lng - origin.lng
  if (Math.abs(latDiff) >= Math.abs(lngDiff)) {
    return latDiff >= 0 ? 'Norte' : 'Sur'
  }
  return lngDiff >= 0 ? 'Este' : 'Oeste'
}

/** Minutos estimados en auto urbano (~35 km/h) */
export function distToMinutes(km: number): number {
  return Math.max(1, Math.round((km / 35) * 60))
}

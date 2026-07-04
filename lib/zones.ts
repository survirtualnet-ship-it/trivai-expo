import { haversineKm } from './eventUtils'

/** Centro aproximado de Santa Cruz de la Sierra */
const SC_CENTER = { lat: -17.7833, lng: -63.1821 }

/** Radio en km para considerar un lugar en el Centro */
const CENTRO_RADIUS_KM = 2.5

export type CityZone = 'Centro' | 'Norte' | 'Sur' | 'Este' | 'Oeste'

export const CITY_ZONES: CityZone[] = ['Centro', 'Norte', 'Sur', 'Este', 'Oeste']

/** Zona cardinal respecto al centro urbano */
export function getCityZone(lat: number, lng: number): CityZone {
  const dist = haversineKm(SC_CENTER.lat, SC_CENTER.lng, lat, lng)
  if (dist <= CENTRO_RADIUS_KM) return 'Centro'

  const latDiff = lat - SC_CENTER.lat
  const lngDiff = lng - SC_CENTER.lng
  if (Math.abs(latDiff) >= Math.abs(lngDiff)) {
    return latDiff >= 0 ? 'Norte' : 'Sur'
  }
  return lngDiff >= 0 ? 'Este' : 'Oeste'
}

/** Minutos estimados en auto urbano (~35 km/h) */
export function distToMinutes(km: number): number {
  return Math.max(1, Math.round((km / 35) * 60))
}

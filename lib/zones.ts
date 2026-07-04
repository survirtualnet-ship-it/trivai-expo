/** Centro aproximado de Santa Cruz de la Sierra */
const SC_CENTER = { lat: -17.7833, lng: -63.1821 }

export type CityZone = 'Norte' | 'Sur' | 'Este' | 'Oeste'

/** Cuadrante cardinal respecto al centro urbano */
export function getCityZone(lat: number, lng: number): CityZone {
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

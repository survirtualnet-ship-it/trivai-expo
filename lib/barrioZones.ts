/** Barrios de Santa Cruz para explorar por zona (mismo set que la web). */

export interface BarrioZone {
  nombre: string
  count: number
  kind: string
  lat: number
  lng: number
}

export const BARRIO_ZONES: BarrioZone[] = [
  { nombre: 'Centro',     count: 128, kind: 'centro',  lat: -17.7858, lng: -63.1823 },
  { nombre: 'Equipetrol', count: 96,  kind: 'bar',     lat: -17.7756, lng: -63.1956 },
  { nombre: 'Las Palmas', count: 74,  kind: 'parque',  lat: -17.7712, lng: -63.2012 },
  { nombre: 'Urbarí',     count: 58,  kind: 'galeria', lat: -17.7921, lng: -63.1756 },
]

const ZONE_EMOJI: Record<string, string> = {
  centro: '🏛️',
  bar: '🍸',
  parque: '🌳',
  galeria: '🛍️',
}

export function getZoneEmoji(kind: string): string {
  return ZONE_EMOJI[kind] ?? '📍'
}

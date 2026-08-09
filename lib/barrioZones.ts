/** Relative map zones around the user's current location — not city-locked. */

export interface BarrioZone {
  nombre: string
  count: number
  kind: string
  lat: number
  lng: number
}

const ZONE_EMOJI: Record<string, string> = {
  centro: '📍',
  norte: '⬆️',
  sur: '⬇️',
  este: '➡️',
  oeste: '⬅️',
}

/** ~3 km offset in degrees (rough). */
const OFFSET = 0.028

/** Build cardinal zones relative to GPS — empty when location unknown. */
export function buildRelativeZones(
  origin: { lat: number; lng: number } | null,
): BarrioZone[] {
  if (!origin) return []
  const { lat, lng } = origin
  return [
    { nombre: 'Cerca', count: 0, kind: 'centro', lat, lng },
    { nombre: 'Norte', count: 0, kind: 'norte', lat: lat + OFFSET, lng },
    { nombre: 'Sur', count: 0, kind: 'sur', lat: lat - OFFSET, lng },
    { nombre: 'Este', count: 0, kind: 'este', lat, lng: lng + OFFSET },
    { nombre: 'Oeste', count: 0, kind: 'oeste', lat, lng: lng - OFFSET },
  ]
}

/** @deprecated Use buildRelativeZones(userCoords) */
export const BARRIO_ZONES: BarrioZone[] = []

export function getZoneEmoji(kind: string): string {
  return ZONE_EMOJI[kind] ?? '📍'
}

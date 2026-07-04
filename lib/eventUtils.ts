/** Utilidades compartidas para eventos — fechas, distancia, agrupación */

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return rad * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function formatEventTime(dt: string) {
  return new Date(dt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

export function formatEventDateShort(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function formatEventDateLong(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function esHoy(dt: string) {
  return new Date(dt).toDateString() === new Date().toDateString()
}

export function esManana(dt: string) {
  const m = new Date()
  m.setDate(m.getDate() + 1)
  return new Date(dt).toDateString() === m.toDateString()
}

export function esEstaNoche(dt: string) {
  const d = new Date(dt)
  const hoy = startOfDay(new Date())
  if (d.toDateString() !== hoy.toDateString()) return false
  const h = d.getHours()
  return h >= 18 || h < 5
}

export function esFinDeSemana(dt: string) {
  const d = startOfDay(new Date(dt))
  const hoy = startOfDay(new Date())
  const day = hoy.getDay()
  const sab = new Date(hoy)
  if (day === 0) sab.setDate(hoy.getDate() - 1)
  else if (day !== 6) sab.setDate(hoy.getDate() + (6 - day))
  const dom = new Date(sab)
  dom.setDate(sab.getDate() + 1)
  return d.getTime() === sab.getTime() || d.getTime() === dom.getTime()
}

export type EventBucket = 'noche' | 'manana' | 'finde' | 'otros'

export function bucketEvent<T extends { start_datetime: string }>(ev: T): EventBucket {
  if (esEstaNoche(ev.start_datetime) || (esHoy(ev.start_datetime) && !esManana(ev.start_datetime))) {
    const h = new Date(ev.start_datetime).getHours()
    if (h >= 18 || h < 5) return 'noche'
  }
  if (esManana(ev.start_datetime)) return 'manana'
  if (esFinDeSemana(ev.start_datetime)) return 'finde'
  if (esHoy(ev.start_datetime)) return 'noche'
  return 'otros'
}

export function groupEventsByBucket<T extends { start_datetime: string }>(events: T[]) {
  const noche: T[] = []
  const manana: T[] = []
  const finde: T[] = []
  for (const ev of events) {
    const b = bucketEvent(ev)
    if (b === 'noche') noche.push(ev)
    else if (b === 'manana') manana.push(ev)
    else if (b === 'finde') finde.push(ev)
  }
  return { noche, manana, finde }
}

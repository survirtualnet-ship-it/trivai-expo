/** Deduplicar lugares importados más de una vez en Supabase */
export function dedupePlaces<
  T extends {
    id: string
    name: string
    rating_count?: number
    rating_avg?: number
    latitude?: number | null
    longitude?: number | null
    address?: string | null
  },
>(places: T[]): T[] {
  const grupos = new Map<string, T>()
  for (const p of places) {
    const key = `${p.name.trim().toLowerCase()}|${p.latitude?.toFixed(4) ?? p.address?.trim().toLowerCase() ?? ''}|${p.longitude?.toFixed(4) ?? ''}`
    const score = p.rating_count ?? p.rating_avg ?? 0
    const previo = grupos.get(key)
    const prevScore = previo ? (previo.rating_count ?? previo.rating_avg ?? 0) : -1
    if (!previo || score > prevScore) grupos.set(key, p)
  }
  return [...grupos.values()]
}

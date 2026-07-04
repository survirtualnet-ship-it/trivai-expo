/**
 * clean-duplicates.mjs
 * Limpia lugares y eventos duplicados en Supabase (producto de importaciones repetidas).
 *
 * - Agrupa lugares por nombre + coordenadas (4 decimales ≈ 11 m).
 * - Conserva la fila con más datos (rating_count, fotos, dirección).
 * - Reasigna favoritos, reseñas y eventos que apunten a filas eliminadas.
 * - Agrupa eventos por nombre + fecha de inicio y reasigna asistentes.
 * - Guarda un respaldo JSON de todo lo afectado antes de tocar nada.
 *
 * Uso:  node scripts/clean-duplicates.mjs          (simulación, no borra)
 *       node scripts/clean-duplicates.mjs --apply  (ejecuta la limpieza)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APPLY = process.argv.includes('--apply')

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  const text = readFileSync(envPath, 'utf-8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

/** Trae TODAS las filas paginando (el límite por consulta es 1000) */
async function fetchAll(table, columns) {
  const rows = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1)
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

function chunk(arr, n) {
  const out = []
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
  return out
}

/** Reasigna filas de `table` con place/event duplicado, respetando la unicidad por usuario */
async function repointOrDelete(table, fkCol, uniqueCol, mapping) {
  const dupIds = [...mapping.keys()]
  let moved = 0, removed = 0
  for (const ids of chunk(dupIds, 100)) {
    const { data: rows, error } = await supabase.from(table).select(`id, ${fkCol}, ${uniqueCol}`).in(fkCol, ids)
    if (error) throw new Error(`${table} select: ${error.message}`)
    for (const row of rows ?? []) {
      const keeperId = mapping.get(row[fkCol])
      const { data: existing } = await supabase.from(table)
        .select('id').eq(fkCol, keeperId).eq(uniqueCol, row[uniqueCol]).maybeSingle()
      if (existing) {
        if (APPLY) await supabase.from(table).delete().eq('id', row.id)
        removed++
      } else {
        if (APPLY) await supabase.from(table).update({ [fkCol]: keeperId }).eq('id', row.id)
        moved++
      }
    }
  }
  return { moved, removed }
}

async function main() {
  console.log(APPLY ? '🚨 MODO APLICAR — se harán cambios reales' : '🔎 MODO SIMULACIÓN — no se borra nada (usa --apply)')

  // ── 1. LUGARES ──────────────────────────────────────────────────────────────
  const places = await fetchAll('places', 'id,name,category,address,latitude,longitude,rating_avg,rating_count,photos,created_at')
  console.log(`\nLugares totales: ${places.length}`)

  const grupos = new Map()
  for (const p of places) {
    // 3 decimales ≈ 110 m: mismo nombre a esa distancia es el mismo lugar
    const key = `${(p.name ?? '').trim().toLowerCase()}|${p.latitude?.toFixed(3) ?? ''}|${p.longitude?.toFixed(3) ?? ''}`
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key).push(p)
  }

  const placeMapping = new Map() // id duplicado → id conservado
  const placeBackup = []
  for (const g of grupos.values()) {
    if (g.length < 2) continue
    g.sort((a, b) =>
      (b.rating_count ?? 0) - (a.rating_count ?? 0) ||
      ((b.photos?.length ?? 0) - (a.photos?.length ?? 0)) ||
      ((b.address ? 1 : 0) - (a.address ? 1 : 0)) ||
      new Date(a.created_at) - new Date(b.created_at)
    )
    const keeper = g[0]
    placeBackup.push(...g)
    for (const dup of g.slice(1)) placeMapping.set(dup.id, keeper.id)
  }
  console.log(`Grupos duplicados: ${placeBackup.length - placeMapping.size} · filas a eliminar: ${placeMapping.size}`)

  // ── 2. EVENTOS ──────────────────────────────────────────────────────────────
  const events = await fetchAll('events', 'id,name,start_datetime,place_id,is_active,created_at')
  console.log(`\nEventos totales: ${events.length}`)

  const gruposEv = new Map()
  for (const e of events) {
    const key = `${(e.name ?? '').trim().toLowerCase()}|${e.start_datetime}`
    if (!gruposEv.has(key)) gruposEv.set(key, [])
    gruposEv.get(key).push(e)
  }

  const eventMapping = new Map()
  const eventBackup = []
  for (const g of gruposEv.values()) {
    if (g.length < 2) continue
    g.sort((a, b) =>
      ((b.place_id ? 1 : 0) - (a.place_id ? 1 : 0)) ||
      ((b.is_active ? 1 : 0) - (a.is_active ? 1 : 0)) ||
      new Date(a.created_at) - new Date(b.created_at)
    )
    eventBackup.push(...g)
    for (const dup of g.slice(1)) eventMapping.set(dup.id, g[0].id)
  }
  console.log(`Eventos duplicados a eliminar: ${eventMapping.size}`)

  // ── 3. RESPALDO ─────────────────────────────────────────────────────────────
  const backupDir = join(__dirname, '..', 'backups')
  mkdirSync(backupDir, { recursive: true })
  const backupPath = join(backupDir, `duplicates-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  writeFileSync(backupPath, JSON.stringify({
    placeMapping: Object.fromEntries(placeMapping),
    eventMapping: Object.fromEntries(eventMapping),
    places: placeBackup,
    events: eventBackup,
  }, null, 2))
  console.log(`\n💾 Respaldo guardado: ${backupPath}`)

  // ── 4. REASIGNAR REFERENCIAS ────────────────────────────────────────────────
  if (placeMapping.size > 0) {
    const favs = await repointOrDelete('favorites', 'place_id', 'user_id', placeMapping)
    console.log(`favorites → movidos: ${favs.moved}, duplicados eliminados: ${favs.removed}`)

    const revs = await repointOrDelete('reviews', 'place_id', 'user_id', placeMapping)
    console.log(`reviews → movidos: ${revs.moved}, duplicados eliminados: ${revs.removed}`)

    // events.place_id no tiene restricción de unicidad: actualización directa
    let evMoved = 0
    for (const ids of chunk([...placeMapping.keys()], 100)) {
      const { data: evs } = await supabase.from('events').select('id, place_id').in('place_id', ids)
      for (const ev of evs ?? []) {
        if (APPLY) await supabase.from('events').update({ place_id: placeMapping.get(ev.place_id) }).eq('id', ev.id)
        evMoved++
      }
    }
    console.log(`events.place_id → reasignados: ${evMoved}`)
  }

  if (eventMapping.size > 0) {
    const att = await repointOrDelete('event_attendees', 'event_id', 'user_id', eventMapping)
    console.log(`event_attendees → movidos: ${att.moved}, duplicados eliminados: ${att.removed}`)
  }

  // ── 5. ELIMINAR DUPLICADOS ──────────────────────────────────────────────────
  if (APPLY) {
    let delP = 0
    for (const ids of chunk([...placeMapping.keys()], 100)) {
      const { error } = await supabase.from('places').delete().in('id', ids)
      if (error) throw new Error('delete places: ' + error.message)
      delP += ids.length
    }
    console.log(`\n🗑  Lugares eliminados: ${delP}`)

    let delE = 0
    for (const ids of chunk([...eventMapping.keys()], 100)) {
      const { error } = await supabase.from('events').delete().in('id', ids)
      if (error) throw new Error('delete events: ' + error.message)
      delE += ids.length
    }
    console.log(`🗑  Eventos eliminados: ${delE}`)
  } else {
    console.log(`\n(Simulación) Se eliminarían ${placeMapping.size} lugares y ${eventMapping.size} eventos.`)
  }

  console.log('\n✅ Listo')
}

main().catch(err => { console.error('💥', err.message); process.exit(1) })

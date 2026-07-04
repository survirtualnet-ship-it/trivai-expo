/**
 * import-places.mjs
 * Importa lugares de gastronomía en Santa Cruz via Google Places API → Supabase.
 *
 * Uso:
 *   node scripts/import-places.mjs
 *
 * Requiere en .env.local:
 *   EXPO_PUBLIC_GOOGLE_MAPS_KEY=...
 *   EXPO_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local')
    const text = readFileSync(envPath, 'utf-8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      process.env[key] = val
    }
  } catch {
    console.error('⚠  No se encontró .env.local')
  }
}
loadEnv()

const GOOGLE_KEY   = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!GOOGLE_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n❌  Faltan variables en .env.local (GOOGLE_KEY, SUPABASE_URL, SERVICE_ROLE_KEY)\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const CATEGORY = 'Gastronomía'
const RADIUS   = 6000 // 6 km por zona

/** Puntos de búsqueda para cubrir la ciudad */
const SEARCH_CENTERS = [
  { lat: -17.7833, lng: -63.1821, label: 'Centro' },
  { lat: -17.7566, lng: -63.1973, label: 'Equipetrol' },
  { lat: -17.7940, lng: -63.2100, label: 'Oeste / Plan 3000' },
  { lat: -17.7650, lng: -63.1650, label: 'Este / Av. Banzer' },
  { lat: -17.8200, lng: -63.1750, label: 'Sur' },
  { lat: -17.7350, lng: -63.1850, label: 'Norte' },
]

/** Tipos oficiales de Google Places — gastronomía */
const GASTRONOMY_TYPES = [
  'restaurant',
  'cafe',
  'bakery',
  'bar',
  'meal_takeaway',
  'meal_delivery',
]

/** Búsquedas por palabra clave (pastelerías, etc.) */
const GASTRONOMY_KEYWORDS = [
  'pastelería',
  'pasteleria',
  'panadería',
  'panaderia',
  'heladería',
  'heladeria',
  'pizzería',
  'pizzeria',
  'sushi',
  'hamburguesería',
  'cafetería',
  'comida rápida',
  'food truck',
  'salteñería',
  'asador',
  'parrilla',
  'cevichería',
  'chifa',
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const sleep = ms => new Promise(r => setTimeout(r, ms))

function parseHours(openingHours) {
  if (!openingHours?.weekday_text) return null
  const h = {}
  openingHours.weekday_text.forEach((line, i) => {
    const colon = line.indexOf(': ')
    if (colon >= 0) h[DIAS[i]] = line.slice(colon + 2)
  })
  return h
}

function photoUrl(ref) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${GOOGLE_KEY}`
}

async function nearbySearch({ lat, lng, type, keyword, pageToken = null }) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${lat},${lng}`
    + `&radius=${RADIUS}`
    + `&language=es`
    + `&key=${GOOGLE_KEY}`
  if (type) url += `&type=${encodeURIComponent(type)}`
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
  if (pageToken) url += `&pagetoken=${pageToken}`
  const res = await fetch(url)
  return res.json()
}

async function placeDetails(placeId) {
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours,geometry'
  const url = `https://maps.googleapis.com/maps/api/place/details/json`
    + `?place_id=${placeId}&fields=${fields}&language=es&key=${GOOGLE_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  return data.result
}

const vistos = new Set()
let totalImportados = 0
let totalActualizados = 0
let totalSaltados = 0

function nearMatch(a, b, eps = 0.0008) {
  return Math.abs(a - b) <= eps
}

async function findExistingPlace(name, lat, lng) {
  const { data } = await supabase
    .from('places')
    .select('id, name, latitude, longitude, photos')
    .ilike('name', name.trim())

  if (!data?.length) return null

  return data.find(p =>
    p.latitude != null &&
    p.longitude != null &&
    nearMatch(p.latitude, lat) &&
    nearMatch(p.longitude, lng),
  ) ?? data[0]
}

async function upsertPlace(row) {
  const fotos = row.photos ?? []
  const { error } = await supabase.from('places').insert(row)

  if (!error) {
    console.log(`   ✓  ${row.name}${fotos.length ? ' 📷' : ''}`)
    totalImportados++
    return
  }

  if (error.code !== '23505') {
    console.error(`   ✗  ${row.name}: ${error.message}`)
    return
  }

  const existing = await findExistingPlace(row.name, row.latitude, row.longitude)
  if (!existing) {
    process.stdout.write(' ~dup')
    totalSaltados++
    return
  }

  const needsPhotos = !existing.photos?.length && fotos.length > 0
  const patch = {
    ...(needsPhotos ? { photos: fotos } : {}),
    category: CATEGORY,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    hours: row.hours,
    phone: row.phone,
    website: row.website,
    address: row.address,
  }

  const hasPatch = Object.values(patch).some(v => v != null && v !== '')
  if (!hasPatch) {
    totalSaltados++
    return
  }

  const { error: upErr } = await supabase.from('places').update(patch).eq('id', existing.id)
  if (upErr) {
    console.error(`   ✗  update ${row.name}: ${upErr.message}`)
    return
  }

  if (needsPhotos) {
    console.log(`   ↻  ${row.name} (fotos añadidas)`)
    totalActualizados++
  } else {
    totalSaltados++
  }
}

async function importarQuery(center, label, { type, keyword }) {
  const queryLabel = [label, type ?? keyword].filter(Boolean).join(' · ')
  console.log(`\n🔍  ${queryLabel}`)
  let pageToken = null
  let pagina = 0

  do {
    if (pageToken) await sleep(2500)
    pagina++

    const data = await nearbySearch({
      lat: center.lat,
      lng: center.lng,
      type,
      keyword,
      pageToken,
    })

    if (data.status === 'ZERO_RESULTS') { console.log('   Sin resultados'); break }
    if (data.status !== 'OK') {
      console.error(`   ⚠  Status: ${data.status} — ${data.error_message ?? ''}`)
      break
    }

    console.log(`   Página ${pagina}: ${data.results.length} resultados`)

    for (const place of data.results) {
      if (vistos.has(place.place_id)) { totalSaltados++; continue }
      vistos.add(place.place_id)

      await sleep(120)

      let d
      try { d = await placeDetails(place.place_id) }
      catch (e) { console.error(`   ✗  ${place.name}: ${e.message}`); continue }

      if (!d?.geometry?.location) continue

      const fotos = (d.photos ?? []).slice(0, 3).map(p => photoUrl(p.photo_reference))

      await upsertPlace({
        name:         d.name,
        category:     CATEGORY,
        description:  null,
        address:      d.formatted_address ?? null,
        city:         'Santa Cruz de la Sierra',
        latitude:     d.geometry.location.lat,
        longitude:    d.geometry.location.lng,
        phone:        d.formatted_phone_number ?? null,
        website:      d.website ?? null,
        hours:        parseHours(d.opening_hours),
        photos:       fotos,
        rating_avg:   d.rating ?? 0,
        rating_count: d.user_ratings_total ?? 0,
        is_open:      true,
        is_sponsored: false,
        is_verified:  false,
      })
    }

    pageToken = data.next_page_token ?? null
  } while (pageToken)
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Importador Gastronomía · Google Places → Supabase')
  console.log(`  ${SEARCH_CENTERS.length} zonas · radio ${RADIUS / 1000} km · categoría: ${CATEGORY}`)
  console.log('═══════════════════════════════════════════════════')

  for (const center of SEARCH_CENTERS) {
    console.log(`\n━━━ Zona: ${center.label} ━━━`)

    for (const type of GASTRONOMY_TYPES) {
      await importarQuery(center, center.label, { type })
      await sleep(600)
    }

    for (const keyword of GASTRONOMY_KEYWORDS) {
      await importarQuery(center, center.label, { keyword })
      await sleep(600)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  ✅  Importados: ${totalImportados} lugares`)
  console.log(`  📷  Actualizados con fotos: ${totalActualizados}`)
  console.log(`  ⤷   Saltados (duplicados): ${totalSaltados}`)
  console.log('═══════════════════════════════════════════════════\n')
}

main().catch(err => {
  console.error('\n💥  Error fatal:', err.message)
  process.exit(1)
})

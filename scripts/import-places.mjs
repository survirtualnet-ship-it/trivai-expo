/**
 * import-places.mjs
 * Busca lugares en Santa Cruz de la Sierra via Google Places API
 * y los importa masivamente a la tabla `places` de Supabase.
 *
 * Uso:
 *   node scripts/import-places.mjs
 *
 * Requiere en .env.local:
 *   EXPO_PUBLIC_GOOGLE_MAPS_KEY=...
 *   EXPO_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (clave de servicio, NO la anon key)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Cargar .env.local ────────────────────────────────────────────────────────
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
    console.error('⚠  No se encontró .env.local — asegúrate de ejecutar desde trivai-app/')
  }
}
loadEnv()

// ─── Variables ────────────────────────────────────────────────────────────────
const GOOGLE_KEY    = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!GOOGLE_KEY || !SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n❌  Faltan variables de entorno en .env.local:')
  if (!GOOGLE_KEY)   console.error('     EXPO_PUBLIC_GOOGLE_MAPS_KEY')
  if (!SUPABASE_URL) console.error('     EXPO_PUBLIC_SUPABASE_URL')
  if (!SERVICE_KEY)  console.error('     SUPABASE_SERVICE_ROLE_KEY')
  console.error('\n   Puedes copiar SUPABASE_SERVICE_ROLE_KEY desde:')
  console.error('   Supabase → Project Settings → API → service_role\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ─── Configuración ────────────────────────────────────────────────────────────
const SANTA_CRUZ = { lat: -17.7833, lng: -63.1821 }
const RADIUS     = 12000  // 12 km de radio

const SEARCHES = [
  { type: 'restaurant',         category: 'Gastronomía'     },
  { type: 'cafe',               category: 'Gastronomía'     },
  { type: 'bar',                category: 'Gastronomía'     },
  { type: 'bakery',             category: 'Gastronomía'     },
  { type: 'meal_takeaway',      category: 'Gastronomía'     },
  { type: 'night_club',         category: 'Entretenimiento' },
  { type: 'museum',             category: 'Entretenimiento' },
  { type: 'art_gallery',        category: 'Entretenimiento' },
  { type: 'movie_theater',      category: 'Entretenimiento' },
  { type: 'tourist_attraction', category: 'Entretenimiento' },
  { type: 'amusement_park',     category: 'Entretenimiento' },
  { type: 'stadium',            category: 'Entretenimiento' },
  { type: 'bowling_alley',      category: 'Entretenimiento' },
  { type: 'gym',                category: 'Entretenimiento' },
  { type: 'spa',                category: 'Otros'           },
  { type: 'shopping_mall',      category: 'Otros'           },
  { type: 'park',               category: 'Parques'         },
  { type: 'campground',         category: 'Parques'         },
]

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Google Places API ────────────────────────────────────────────────────────
async function nearbySearch(type, pageToken = null) {
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
    + `?location=${SANTA_CRUZ.lat},${SANTA_CRUZ.lng}`
    + `&radius=${RADIUS}&type=${type}&language=es&key=${GOOGLE_KEY}`
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

// ─── Importar un tipo de lugar ────────────────────────────────────────────────
const vistos = new Set()
let totalImportados = 0
let totalActualizados = 0
let totalSaltados   = 0

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

async function importarTipo(type, category) {
  console.log(`\n🔍  ${type.padEnd(20)} → ${category}`)
  let pageToken = null
  let pagina = 0

  do {
    if (pageToken) await sleep(2500) // Google exige espera entre páginas
    pagina++

    const data = await nearbySearch(type, pageToken)

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

      const fotos = (d.photos ?? []).slice(0, 3).map(p => photoUrl(p.photo_reference))

      const row = {
        name:         d.name,
        category,
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
      }

      await upsertPlace(row)
    }

    pageToken = data.next_page_token ?? null
  } while (pageToken)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Importador Google Places → Supabase')
  console.log(`  Radio: ${RADIUS / 1000} km · Santa Cruz de la Sierra`)
  console.log('═══════════════════════════════════════════════════')

  for (const { type, category } of SEARCHES) {
    await importarTipo(type, category)
    await sleep(800)
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

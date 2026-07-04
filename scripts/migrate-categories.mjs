/**
 * migrate-categories.mjs
 * Unifica places.category y events.category a las 4 categorías oficiales.
 *
 * Uso: node scripts/migrate-categories.mjs
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local (anon key no puede hacer bulk update con RLS)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const LEGACY_MAP = {
  Restaurante:      'Gastronomía',
  Cafetería:        'Gastronomía',
  Gastronomía:      'Gastronomía',
  Bar:              'Gastronomía',
  Mercado:          'Gastronomía',
  Música:           'Entretenimiento',
  Cine:             'Entretenimiento',
  Arte:             'Entretenimiento',
  'Arte y cultura': 'Entretenimiento',
  Cultura:          'Entretenimiento',
  Entretenimiento:  'Entretenimiento',
  Deportes:         'Entretenimiento',
  Deporte:          'Entretenimiento',
  Turismo:          'Entretenimiento',
  Social:           'Entretenimiento',
  Parque:           'Parques',
  Naturaleza:       'Parques',
  Parques:          'Parques',
  Bienestar:        'Otros',
  Comercio:         'Otros',
  Otros:            'Otros',
}

function loadEnv() {
  const env = {}
  readFileSync(join(__dirname, '..', '.env.local'), 'utf-8').split('\n').forEach(line => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if (i < 0) return
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  })
  return env
}

const env = loadEnv()
if (!env.EXPO_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Requiere EXPO_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const sb = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function migrateTable(table) {
  let updated = 0
  for (const [oldCat, newCat] of Object.entries(LEGACY_MAP)) {
    if (oldCat === newCat) continue
    const { data, error } = await sb.from(table).update({ category: newCat }).eq('category', oldCat).select('id')
    if (error) throw error
    if (data?.length) {
      console.log(`  ${table}: "${oldCat}" → "${newCat}" (${data.length})`)
      updated += data.length
    }
  }
  return updated
}

console.log('Migrando categorías…\n')
const places = await migrateTable('places')
const events = await migrateTable('events')
console.log(`\n✓ ${places} lugares y ${events} eventos actualizados.`)

const [{ data: p }, { data: e }] = await Promise.all([
  sb.from('places').select('category'),
  sb.from('events').select('category'),
])
const counts = {}
for (const r of [...(p ?? []), ...(e ?? [])]) {
  counts[r.category] = (counts[r.category] ?? 0) + 1
}
console.log('\nDistribución actual:')
for (const [cat, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`)
}

// Categorías desconocidas → Otros
const OFFICIAL = new Set(['Gastronomía', 'Entretenimiento', 'Parques', 'Otros'])
for (const table of ['places', 'events']) {
  const { data } = await sb.from(table).select('category')
  const unknown = [...new Set((data ?? []).map(r => r.category).filter(c => !OFFICIAL.has(c)))]
  for (const cat of unknown) {
    const { data: rows, error } = await sb.from(table).update({ category: 'Otros' }).eq('category', cat).select('id')
    if (error) throw error
    if (rows?.length) console.log(`  ${table}: "${cat}" → "Otros" (${rows.length})`)
  }
}

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
try {
  readFileSync(join(__dirname, '..', '.env.local'), 'utf-8').split('\n').forEach(line => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if (i < 0) return
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  })
} catch {
  console.error('No .env.local')
  process.exit(1)
}

const sb = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
const [{ data: places }, { data: events }] = await Promise.all([
  sb.from('places').select('category'),
  sb.from('events').select('category').eq('is_active', true),
])
const counts = {}
for (const row of [...(places ?? []), ...(events ?? [])]) {
  counts[row.category] = (counts[row.category] ?? 0) + 1
}
console.log(JSON.stringify(Object.entries(counts).sort((a, b) => b[1] - a[1]), null, 2))

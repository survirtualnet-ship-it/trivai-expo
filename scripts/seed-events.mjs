/**
 * seed-events.mjs
 * Inserta eventos de muestra reales/representativos de Santa Cruz de la Sierra.
 *
 * Uso:
 *   node scripts/seed-events.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  try {
    const text = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    }
  } catch { console.error('⚠  No se encontró .env.local') }
}
loadEnv()

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Fechas relativas a hoy
function dias(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}
function dt(daysAhead, hour = 20, min = 0) {
  const d = dias(daysAhead)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

const EVENTOS = [
  {
    name: 'Festival de Jazz en el Casco Viejo',
    category: 'Música',
    description: '📍 Plaza 24 de Septiembre\n\nTres noches de jazz en vivo con artistas locales e invitados internacionales. Entrada libre, sillas y bebidas disponibles en el lugar.',
    start_datetime: dt(2),
    end_datetime: dt(4, 23, 0),
    is_free: true, price: 0,
    is_featured: true,
  },
  {
    name: 'Feria Gastronómica Cruceña',
    category: 'Gastronomía',
    description: '📍 Parque Arenal, Equipetrol\n\nMás de 40 restaurantes y puestos de comida típica cruceña. Majao, locro, cuñapé, empanadas y mucho más. También habrá zona de food trucks internacionales.',
    start_datetime: dt(3, 11, 0),
    end_datetime: dt(5, 22, 0),
    is_free: false, price: 30,
    is_featured: true,
  },
  {
    name: 'Exposición de Arte Contemporáneo',
    category: 'Arte',
    description: '📍 Manzana Uno — Centro Cultural\n\nExposición colectiva de 15 artistas plásticos bolivianos. Pintura, escultura e instalaciones interactivas. Inauguración con coctel el primer día.',
    start_datetime: dt(1, 19, 0),
    end_datetime: dt(14, 21, 0),
    is_free: false, price: 20,
    is_featured: false,
  },
  {
    name: 'Torneo de Fútbol Interbarrios',
    category: 'Deportes',
    description: '📍 Estadio Tahuichi Aguilera\n\nTorneo relámpago con 16 equipos de diferentes barrios de la ciudad. Finales el domingo con premiación y brunch para todos los asistentes.',
    start_datetime: dt(5, 8, 0),
    end_datetime: dt(7, 18, 0),
    is_free: true, price: 0,
    is_featured: false,
  },
  {
    name: 'Noche de Comedia Stand-Up',
    category: 'Entretenimiento',
    description: '📍 Teatro Rex, Calle René Moreno\n\nUna noche de risas con los mejores comediantes de Bolivia. Tres actos con apertura de nuevos talentos locales. Bar disponible durante el show.',
    start_datetime: dt(6, 20, 30),
    is_free: false, price: 80,
    is_featured: true,
  },
  {
    name: 'Mercado Artesanal de Las Palmas',
    category: 'Cultura',
    description: '📍 Barrio Las Palmas — Rotonda principal\n\nMercado dominical de artesanías, ropa bohemia, plantas, joyería y arte local. Música en vivo y zona de comida vegetariana.',
    start_datetime: dt(7, 9, 0),
    end_datetime: dt(7, 14, 0),
    is_free: true, price: 0,
    is_featured: false,
  },
  {
    name: 'Maratón Santa Cruz 10K',
    category: 'Deportes',
    description: '📍 Salida: Monumento al Cristo Rey\n\nCarrera popular de 10 kilómetros por las principales avenidas de la ciudad. Categorías para niños, adultos y adultos mayores. Inscripción previa requerida.',
    start_datetime: dt(10, 6, 0),
    is_free: false, price: 50,
    is_featured: true,
  },
  {
    name: 'Cine al Aire Libre — Clásicos Bolivianos',
    category: 'Arte',
    description: '📍 Parque Urbano Central\n\nProyecciones gratuitas de películas bolivianas clásicas y contemporáneas. Trae tu silla o manta. Palomitas y bebidas disponibles a precio social.',
    start_datetime: dt(4, 20, 0),
    end_datetime: dt(6, 23, 0),
    is_free: true, price: 0,
    is_featured: false,
  },
  {
    name: 'Taller de Cocina Cruceña',
    category: 'Gastronomía',
    description: '📍 Escuela Gastronómica Bolivia, Urbarí\n\nAprende a preparar los platos típicos de Santa Cruz: majao, sopa de maní, locro de gallina y masaco. Cupo limitado a 20 personas. Incluye almuerzo.',
    start_datetime: dt(8, 10, 0),
    end_datetime: dt(8, 14, 0),
    is_free: false, price: 120,
    is_featured: false,
  },
  {
    name: 'Concierto de Rock Nacional',
    category: 'Música',
    description: '📍 Complejo Ferial, Av. Santos Dumont\n\nLa mejor noche de rock en Santa Cruz con 5 bandas en escena. Apertura de doors a las 19:00, primer acto a las 20:30. Bar, food trucks y zona VIP.',
    start_datetime: dt(9, 20, 0),
    is_free: false, price: 100,
    is_featured: true,
  },
  {
    name: 'Feria del Libro Santa Cruz',
    category: 'Cultura',
    description: '📍 Centro de Convenciones, Av. Monseñor Rivero\n\nEdición anual de la feria con más de 80 expositores nacionales e internacionales. Presentaciones de autores, talleres de escritura y zona infantil.',
    start_datetime: dt(12, 10, 0),
    end_datetime: dt(19, 20, 0),
    is_free: true, price: 0,
    is_featured: false,
  },
  {
    name: 'Yoga y Meditación en el Parque',
    category: 'Social',
    description: '📍 Jardín Botánico, 3er Anillo\n\nClase colectiva de yoga al amanecer seguida de sesión de meditación guiada. Instructor certificado. Trae tu mat o alquila uno en el lugar (Bs. 10).',
    start_datetime: dt(1, 7, 0),
    is_free: true, price: 0,
    is_featured: false,
  },
]

async function main() {
  console.log('🌱  Insertando eventos de muestra...\n')

  let ok = 0, err = 0

  for (const ev of EVENTOS) {
    const row = {
      ...ev,
      place_id: null,
      attendees_count: Math.floor(Math.random() * 80),
      photos: [],
      is_active: true,
      end_datetime: ev.end_datetime ?? null,
    }

    const { error } = await supabase.from('events').insert(row)
    if (error) {
      console.error(`  ✗  ${ev.name}: ${error.message}`)
      err++
    } else {
      console.log(`  ✓  ${ev.name}`)
      ok++
    }
  }

  console.log(`\n══════════════════════════════════`)
  console.log(`  ✅  ${ok} eventos insertados`)
  if (err > 0) console.log(`  ❌  ${err} errores`)
  console.log(`══════════════════════════════════\n`)
}

main().catch(err => { console.error('Error:', err); process.exit(1) })

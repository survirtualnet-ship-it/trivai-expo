/** Categorías oficiales de Trivai — fuente única de verdad */

export const CATEGORIES = [
  'Gastronomía',
  'Entretenimiento',
  'Parques',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_META: Record<
  Category,
  { emoji: string; color: string; label: string; slug: string }
> = {
  Gastronomía:      { emoji: '🍽️', color: '#FF6B2C', label: 'Gastronomía',      slug: 'gastronomia'      },
  Entretenimiento:  { emoji: '🎭', color: '#6C4CF1', label: 'Entretenimiento',  slug: 'entretenimiento'  },
  Parques:          { emoji: '🌳', color: '#2BB673', label: 'Parques',          slug: 'parques'          },
  Otros:            { emoji: '✨', color: '#8A8590', label: 'Otros',            slug: 'otros'            },
}

/** Valores legacy en Supabase → categoría nueva */
export const LEGACY_CATEGORY_MAP: Record<string, Category> = {
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
  Turismo:          'Entretenimiento',
  Social:           'Entretenimiento',
  Parque:           'Parques',
  Naturaleza:       'Parques',
  Parques:          'Parques',
  Bienestar:        'Otros',
  Comercio:         'Otros',
  Deporte:          'Entretenimiento',
  Otros:            'Otros',
}

export function normalizeCategory(cat: string | null | undefined): Category {
  if (!cat) return 'Otros'
  if ((CATEGORIES as readonly string[]).includes(cat)) return cat as Category
  return LEGACY_CATEGORY_MAP[cat] ?? 'Otros'
}

export function getCatEmoji(cat: string) {
  return CATEGORY_META[normalizeCategory(cat)].emoji
}

export function getCatColor(cat: string) {
  return CATEGORY_META[normalizeCategory(cat)].color
}

export function getCatLabel(cat: string) {
  return CATEGORY_META[normalizeCategory(cat)].label
}

/** Chips para filtros (sin "Todos") */
export const CATEGORY_CHIPS = CATEGORIES.map(id => ({
  id,
  ...CATEGORY_META[id],
}))

/** Filtros de lugares: Todos + 4 categorías */
export const PLACE_CATEGORY_FILTERS = [
  { id: 'Todos' as const, label: 'Todos', emoji: '🗺️', color: '#8A8590' },
  ...CATEGORY_CHIPS,
]

export type PlaceCategoryFilter = (typeof PLACE_CATEGORY_FILTERS)[number]['id']

/** Filtros de eventos por categoría (además de Hoy / Gratuitos) */
export const EVENT_CATEGORY_FILTERS = ['Gastronomía', 'Entretenimiento', 'Parques', 'Otros'] as const

// Design tokens — equivalente a T.* en trivai web

export const T = {
  green:       '#21A24A',
  greenSoft:   '#DCF1E1',
  orange:      '#F26B1F',
  orangeSoft:  '#FDE6D6',
  purple:      '#6D28FF',
  purpleSoft:  '#ECE3FF',
  purpleInk:   '#5B21D6',
  fab:         '#6531F0',
  bg:          '#F6F5F7',
  surface:     '#FFFFFF',
  muted:       '#F1EFF3',
  fg1:         '#15131A',
  fg2:         '#4B4754',
  fg3:         '#8A8590',
  fg4:         '#C9C5CF',
  border:      '#ECE9EF',
  border2:     '#E2DEE7',
  danger:      '#E1325A',
  dangerSoft:  '#FBE0E7',
  warning:     '#F2A91F',
} as const

// Fuentes (usar con fontWeight en lugar de importar fuentes externas)
export const F = {
  size: { xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 17, xxl: 20, h1: 24 },
  weight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
} as const

// Espaciado
export const S = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
} as const

// Bordes
export const R = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
} as const

// Categorías Supabase → color/emoji de mapa
export const CAT_COLOR: Record<string, string> = {
  'Restaurante':    T.orange,
  'Gastronomía':    T.orange,
  'Cafetería':      '#8B4513',
  'Arte y cultura': T.purple,
  'Arte':           T.purple,
  'Música':         T.purple,
  'Entretenimiento': T.green,
  'Parque':         T.green,
}

export const CAT_EMOJI: Record<string, string> = {
  'Restaurante': '🍖', 'Cafetería': '☕', 'Bar': '🍺',
  'Arte y cultura': '🎨', 'Arte': '🎨', 'Parque': '🌳',
  'Música': '🎵', 'Gastronomía': '🍽️', 'Entretenimiento': '🎟️',
}

export function getCatEmoji(cat: string) { return CAT_EMOJI[cat] ?? '📍' }
export function getCatColor(cat: string) { return CAT_COLOR[cat] ?? T.fg3 }

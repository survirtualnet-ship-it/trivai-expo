// Design tokens — premium event discovery

export const T = {
  primary:     '#6C4CF1',
  secondary:   '#2BB673',
  accent:      '#FF6B2C',
  green:       '#2BB673',
  greenSoft:   '#DFF5EA',
  orange:      '#FF6B2C',
  orangeSoft:  '#FFE9DD',
  purple:      '#6C4CF1',
  purpleSoft:  '#EBE6FD',
  purpleInk:   '#5335D9',
  fab:         '#6C4CF1',
  bg:          '#F8F7FA',
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
  greenInk:    '#166534',
  orangeInk:   '#B45309',
  overlay:     'rgba(10, 8, 14, 0.55)',
} as const

export const SHADOW = {
  sm: {
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#15131A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  fab: {
    shadowColor: '#6C4CF1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
} as const

export const F = {
  size: { xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 17, xxl: 20, h1: 26, hero: 28 },
  weight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
} as const

export const S = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
} as const

export const R = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
} as const

// Categorías — fuente única en lib/categories.ts
export {
  CATEGORIES,
  CATEGORY_CHIPS,
  PLACE_CATEGORY_FILTERS,
  EVENT_CATEGORY_FILTERS,
  normalizeCategory,
  getCatEmoji,
  getCatColor,
  getCatLabel,
} from './categories'
export type { Category, PlaceCategoryFilter } from './categories'

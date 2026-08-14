/**
 * Trivai Design System — single source of truth for visual tokens.
 * Import via `@/src/design` or legacy `@/lib/tokens` (re-exports).
 */
import { colors } from './colors'
import { spacing } from './spacing'
import { radius } from './radius'
import { shadows } from './shadows'
import { fontSize, fontWeight } from './typography'
import { components } from './components'
import { icons } from './icons'

/** Legacy `T` alias — used across most of the app via StyleSheet */
export const T = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.primary,
  green: colors.secondary,
  greenSoft: colors.secondarySoft,
  orange: colors.primary,
  orangeSoft: colors.primarySoft,
  purple: colors.primary,
  purpleSoft: colors.primarySoft,
  purpleInk: colors.primaryInk,
  fab: colors.primary,
  bg: colors.background,
  surface: colors.surface,
  muted: colors.surfaceMuted,
  fg1: colors.text,
  fg2: colors.textSecondary,
  fg3: colors.textMuted,
  fg4: colors.textDisabled,
  border: colors.border,
  border2: colors.borderStrong,
  danger: colors.danger,
  dangerSoft: colors.dangerSoft,
  warning: colors.warning,
  greenInk: colors.secondaryInk,
  orangeInk: colors.primaryInk,
  overlay: colors.overlay,
  onPrimary: colors.onPrimary,
} as const

export const SHADOW = shadows

export const F = {
  size: fontSize,
  weight: fontWeight,
} as const

export const S = spacing
export const R = radius

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  typography: { fontSize, fontWeight },
  components,
  icons,
  T,
  F,
  S,
  R,
  SHADOW,
} as const

export type TrivaiTheme = typeof theme

// Re-export category helpers (unchanged business logic)
export {
  CATEGORIES,
  CATEGORY_CHIPS,
  PLACE_CATEGORY_FILTERS,
  EVENT_CATEGORY_FILTERS,
  normalizeCategory,
  getCatEmoji,
  getCatColor,
  getCatLabel,
} from '@/lib/categories'
export type { Category, PlaceCategoryFilter } from '@/lib/categories'

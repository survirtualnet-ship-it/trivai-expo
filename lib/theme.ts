/**
 * Legacy theme — re-exports from Design System + compatibility aliases.
 * Prefer `@/src/design` or `@/lib/tokens` for new code.
 */
import {
  colors as designColors,
  spacing,
  radius,
  shadows,
  fontSize,
  fontWeight,
} from '@/src/design'

/** Legacy key aliases for gradual migration */
export const colors = {
  ...designColors,
  muted: designColors.surfaceMuted,
  textTertiary: designColors.textMuted,
  mapPin: designColors.text,
} as const

export { spacing, radius, shadows }

export const typography = {
  title: { fontSize: fontSize.h1, fontWeight: fontWeight.semibold, letterSpacing: -0.8 },
  headline: { fontSize: fontSize.h3, fontWeight: fontWeight.semibold, letterSpacing: -0.4 },
  body: { fontSize: fontSize.md, fontWeight: fontWeight.normal },
  callout: { fontSize: fontSize.lg, fontWeight: fontWeight.normal },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.normal },
  footnote: { fontSize: fontSize.xs, fontWeight: fontWeight.normal },
} as const

export const shadow = {
  soft: shadows.sm,
  card: shadows.card,
} as const

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
} as const

export type Theme = typeof theme

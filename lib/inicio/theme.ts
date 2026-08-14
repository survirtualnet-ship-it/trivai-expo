/** Inicio module tokens — derived from Design System */
import { colors, spacing, radius, shadows } from '@/src/design'

export const I = {
  bg: colors.surface,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textMuted,
  border: colors.border,
  fill: colors.surfaceMuted,
  accent: colors.primary,
  card: colors.surface,
  shadow: colors.text,
} as const

export const SP = spacing
export const RD = { md: radius.lg, lg: radius.xl, full: radius.full } as const

export const cardShadow = shadows.md
export const softShadow = shadows.sm

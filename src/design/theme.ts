import { colors } from './colors'
import { spacing } from './spacing'
import { radius } from './radius'
import { fontSize } from './typography'
import { shadows } from './shadows'

/**
 * Light module theme — shared by category, map, activity, profile, onboarding.
 * Replaces previous dark `#0B0F1A` islands with the official Trivai light palette.
 */
export const lightModuleTheme = {
  bg: colors.background,
  surface: colors.surface,
  surfaceElevated: colors.surface,
  surfaceMuted: colors.surfaceMuted,
  border: colors.border,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  accent: colors.primary,
  accentSecondary: colors.secondary,
  accentSoft: colors.primarySoft,
  trending: colors.primary,
  recommended: colors.warning,
  event: colors.info,
  success: colors.secondary,
  danger: colors.danger,
  warning: colors.warning,
  shadow: 'rgba(26, 26, 26, 0.08)',
  gradientStart: colors.primary,
  gradientEnd: colors.primaryInk,
  pinDefault: colors.primary,
  radius,
  spacing,
  font: {
    hero: fontSize.hero,
    title: fontSize.h2,
    subtitle: fontSize.lg,
    body: fontSize.md,
    caption: fontSize.sm,
  },
} as const

export type LightModuleTheme = typeof lightModuleTheme

/** Full app theme object */
export { theme } from './tokens'

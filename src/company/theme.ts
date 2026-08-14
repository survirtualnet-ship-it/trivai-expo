import { colors, spacing, radius, shadows, fontSize, fontWeight, typography } from '@/src/design'

/** Business / company module — aligned with official palette */
export const companyTheme = {
  bg: colors.background,
  surface: colors.surface,
  surfaceMuted: colors.surfaceMuted,
  border: colors.border,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  success: colors.secondary,
  successSoft: colors.secondarySoft,
  warning: colors.primary,
  star: colors.warning,
  shadow: 'rgba(26, 26, 26, 0.08)',
  radius,
  spacing,
} as const

/** Home module tokens — derived from Design System */
import { colors, spacing, radius, shadows } from '@/src/design'

export const H = {
  bg: colors.surface,
  text: colors.text,
  textSecondary: colors.textSecondary,
  border: colors.border,
  accent: colors.primary,
  searchBg: colors.surfaceMuted,
  emergencyBg: colors.dangerSoft,
  emergencyBorder: colors.dangerSoft,
  emergencyAccent: colors.danger,
  overlay: colors.overlay,
  padX: spacing.lg,
  sectionGap: spacing.xxl,
  gap: spacing.md,
  radius: radius.lg,
  radiusLg: radius.xl,
} as const

export const homeShadow = {
  card: shadows.md,
  soft: shadows.sm,
} as const

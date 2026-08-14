import { colors as designColors } from '@/src/design/colors'

/** Tab bar & Inicio — derived from Design System */
export const colors = {
  background: designColors.background,
  card: designColors.surface,
  text: designColors.text,
  textSecondary: designColors.textSecondary,
  textTertiary: designColors.textMuted,
  border: designColors.border,
  fill: designColors.surfaceMuted,
  accent: designColors.primary,
  white: designColors.surface,
  black: designColors.text,
  tintOrange: designColors.primary,
  tintPurple: designColors.primary,
  tintGreen: designColors.secondary,
  tintBlue: designColors.info,
  tintRed: designColors.danger,
  tintGray: designColors.textMuted,
  accentSoft: designColors.primarySoft,
  planBg: designColors.primarySoft,
  planBorder: designColors.border,
  alertOk: designColors.secondary,
  alertWarn: designColors.warning,
  alertBg: designColors.dangerSoft,
} as const

export type ColorName = keyof typeof colors

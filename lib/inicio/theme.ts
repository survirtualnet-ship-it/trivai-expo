/** Apple-style design tokens for Inicio / main tabs */

export const I = {
  bg: '#FFFFFF',
  text: '#111111',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  border: '#E5E5EA',
  fill: '#F2F2F7',
  accent: '#0A84FF',
  card: '#FFFFFF',
  shadow: '#000000',
} as const

export const SP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const

export const RD = {
  md: 16,
  lg: 20,
  full: 999,
} as const

export const cardShadow = {
  shadowColor: I.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const

export const softShadow = {
  shadowColor: I.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const

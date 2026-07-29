/**
 * Apple-style design tokens for TRIVAI product surfaces.
 * Prefer importing from here for new screens; legacy code may still use lib/tokens.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  muted: '#F2F2F7',
  text: '#111111',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5EA',
  primary: '#6C4CF1',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  overlay: 'rgba(0,0,0,0.4)',
  mapPin: '#111111',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const

export const typography = {
  title: { fontSize: 34, fontWeight: '600' as const, letterSpacing: -0.8 },
  headline: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.4 },
  body: { fontSize: 16, fontWeight: '400' as const },
  callout: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  footnote: { fontSize: 12, fontWeight: '400' as const },
} as const

export const shadow = {
  soft: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  card: {
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow,
} as const

export type Theme = typeof theme

import { colors } from './colors'

/**
 * Icon sizing & stroke — use lucide-react-native across the app.
 * @see https://lucide.dev
 */
export const icons = {
  /** Standard sizes */
  size: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  },
  /** Stroke width — consistent weight */
  stroke: {
    light: 1.75,
    default: 2,
    bold: 2.25,
  },
  /** Contextual colors */
  color: {
    default: colors.textSecondary,
    muted: colors.textMuted,
    primary: colors.primary,
    secondary: colors.secondary,
    onSurface: colors.text,
    inverse: colors.onPrimary,
  },
} as const

export type DesignIcons = typeof icons

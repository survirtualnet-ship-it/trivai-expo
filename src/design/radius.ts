/** Unified border radii — prefer xl (16) and 2xl (20) for cards. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const

export type DesignRadius = typeof radius

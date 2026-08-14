import { spacing } from './spacing'

/** Font sizes — clear hierarchy: hero > title > subtitle > body > caption */
export const fontSize = {
  caption: 11,
  xs: 12,
  sm: 13,
  md: 14,
  lg: 15,
  xl: 17,
  xxl: 20,
  h3: 22,
  h2: 26,
  h1: 28,
  hero: 32,
} as const

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const typography = {
  hero: {
    fontSize: fontSize.hero,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  h1: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  h2: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: 22,
  },
  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: 22,
  },
  caption: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: 18,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
} as const

export type DesignTypography = typeof typography

/** @deprecated use spacing from design system */
export { spacing }

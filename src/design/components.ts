import { radius } from './radius'
import { spacing } from './spacing'

/** Shared component dimensions — buttons, inputs, cards, headers. */
export const components = {
  button: {
    height: 48,
    heightLg: 52,
    minWidth: 120,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  iconButton: {
    size: 44,
    sizeSm: 36,
    borderRadius: radius.full,
    padding: spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  header: {
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    height: 32,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  bottomSheet: {
    borderRadius: radius.xxl,
  },
} as const

export type DesignComponents = typeof components

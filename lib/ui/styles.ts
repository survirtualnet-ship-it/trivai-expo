import { StyleSheet } from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

/** Shared layout + surface primitives for the UI kit */
export const UI = {
  card: {
    backgroundColor: T.surface,
    borderRadius: R.xl,
    overflow: 'hidden' as const,
    ...SHADOW.sm,
  },
  cardBody: {
    paddingHorizontal: S.md,
    paddingTop: S.md,
    paddingBottom: S.md,
    gap: 6,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowGap: S.xs,
  metaGap: 4,
} as const

export const uiText = StyleSheet.create({
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  titleLg: {
    fontFamily: FONT.semibold,
    fontSize: F.size.lg,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: F.size.xs,
    fontWeight: F.weight.medium,
    color: T.fg2,
  },
})

export const PLACE_CARD_W = 188
export const PLACE_CARD_IMAGE_H = 140
export const CATEGORY_CARD_W = 140
export const CATEGORY_CARD_H = 112

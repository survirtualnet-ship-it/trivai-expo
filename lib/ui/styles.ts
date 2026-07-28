import { StyleSheet } from 'react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

/** Shared layout + surface primitives for the UI kit */
export const UI = {
  card: {
    backgroundColor: T.surface,
    borderRadius: R.xl,
    overflow: 'hidden' as const,
    ...SHADOW.md,
  },
  cardBody: {
    padding: S.md,
    gap: S.sm,
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
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  titleLg: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
})

export const PLACE_CARD_W = 200
export const PLACE_CARD_IMAGE_H = 128
export const CATEGORY_CARD_W = 140
export const CATEGORY_CARD_H = 112

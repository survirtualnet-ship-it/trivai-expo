import { F } from '@/lib/tokens'

/** Inter cuando está cargada; fallback system sans-serif */
export const FONT = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
} as const

export const text = {
  h1:     { fontFamily: FONT.bold,     fontSize: F.size.h1,  fontWeight: F.weight.bold     as '700', color: undefined },
  h2:     { fontFamily: FONT.bold,     fontSize: F.size.xxl, fontWeight: F.weight.bold     as '700', color: undefined },
  title:  { fontFamily: FONT.semibold, fontSize: F.size.xl,  fontWeight: F.weight.semibold as '600', color: undefined },
  body:   { fontFamily: FONT.regular,  fontSize: F.size.md,  fontWeight: F.weight.normal   as '400', color: undefined },
  caption:{ fontFamily: FONT.medium,   fontSize: F.size.sm,  fontWeight: F.weight.medium   as '500', color: undefined },
  label:  { fontFamily: FONT.semibold, fontSize: F.size.xs,  fontWeight: F.weight.semibold as '600', color: undefined },
} as const

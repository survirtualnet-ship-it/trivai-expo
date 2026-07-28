import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

/** Design-system chip variants */
export type ChipVariant = 'primary' | 'secondary' | 'outlined'
export type TagSize = 'sm' | 'md'

/** @deprecated Use ChipVariant */
export type TagVariant = ChipVariant | 'default' | 'accent' | 'purple' | 'outline' | 'success'

export type TagProps = {
  label: string
  variant?: ChipVariant | TagVariant
  size?: TagSize
}

const VARIANTS: Record<ChipVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: T.purpleSoft, text: T.purpleInk },
  secondary: { bg: T.muted, text: T.fg2 },
  outlined: { bg: T.surface, text: T.fg2, border: T.border },
}

const LEGACY_MAP: Record<string, ChipVariant> = {
  default: 'secondary',
  accent: 'primary',
  purple: 'primary',
  outline: 'outlined',
  success: 'primary',
}

function resolveVariant(variant: TagVariant): ChipVariant {
  return LEGACY_MAP[variant] ?? (variant as ChipVariant)
}

export const Tag = memo(function Tag({
  label,
  variant = 'secondary',
  size = 'sm',
}: TagProps) {
  const resolved = resolveVariant(variant)
  const palette = VARIANTS[resolved]
  const isMd = size === 'md'

  return (
    <View
      style={[
        styles.chip,
        isMd && styles.chipMd,
        { backgroundColor: palette.bg },
        palette.border != null && { borderWidth: 1, borderColor: palette.border },
      ]}
    >
      <Text
        style={[styles.text, isMd && styles.textMd, { color: palette.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  )
})

export type TagRowProps = {
  tags: string[]
  variant?: TagVariant
  size?: TagSize
  max?: number
}

export const TagRow = memo(function TagRow({
  tags,
  variant = 'secondary',
  size = 'sm',
  max = 3,
}: TagRowProps) {
  if (!tags.length) return null

  return (
    <View style={styles.row}>
      {tags.slice(0, max).map(tag => (
        <Tag key={tag} label={tag} variant={variant} size={size} />
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: S.sm,
    paddingVertical: 4,
    borderRadius: R.full,
  },
  chipMd: {
    paddingHorizontal: S.md,
    paddingVertical: 6,
  },
  text: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    fontWeight: F.weight.semibold,
  },
  textMd: {
    fontSize: F.size.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.xs,
  },
})

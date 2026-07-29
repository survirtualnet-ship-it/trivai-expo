import { memo } from 'react'
import { View, Text, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { colors, radius, typography } from '@/lib/theme'

type Props = {
  uri?: string | null
  name?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

function initialsFromName(name?: string) {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const Avatar = memo(function Avatar({
  uri,
  name,
  size = 64,
  style,
}: Props) {
  const r = size / 2

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: r }, style as object]}
        accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
      />
    )
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: r },
        style,
      ]}
      accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>
        {initialsFromName(name)}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.headline,
    color: colors.textSecondary,
  },
})

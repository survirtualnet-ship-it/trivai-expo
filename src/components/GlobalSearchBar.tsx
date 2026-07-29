import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import type { Locale } from '../data/mock'

type Props = {
  locale: Locale
  onPress: () => void
}

export const GlobalSearchBar = memo(function GlobalSearchBar({ locale, onPress }: Props) {
  const placeholder =
    locale === 'EN' ? 'What do you want to do today?' : '¿Qué quieres hacer hoy?'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
    >
      <View style={styles.bar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      </View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  bar: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  placeholder: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
})

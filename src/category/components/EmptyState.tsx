import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { categoryTheme } from '../theme'

type Props = {
  locale: 'ES' | 'EN'
  onClearFilters: () => void
}

export const EmptyState = memo(function EmptyState({ locale, onClearFilters }: Props) {
  const title = locale === 'EN' ? 'No places found' : 'No hay lugares'
  const subtitle =
    locale === 'EN'
      ? 'Try another subcategory or zone'
      : 'Prueba otra subcategoría o zona'
  const cta = locale === 'EN' ? 'Clear filters' : 'Limpiar filtros'

  return (
    <Animated.View entering={FadeIn.duration(280)} style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="search-outline" size={32} color={categoryTheme.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable
        onPress={onClearFilters}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.btnText}>{cta}</Text>
      </Pressable>
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: categoryTheme.spacing.xxl,
    paddingVertical: categoryTheme.spacing.xxl * 2,
    gap: categoryTheme.spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: categoryTheme.surface,
    borderWidth: 1,
    borderColor: categoryTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: categoryTheme.text,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: categoryTheme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: categoryTheme.spacing.sm,
    paddingHorizontal: categoryTheme.spacing.xl,
    paddingVertical: 12,
    borderRadius: categoryTheme.radius.full,
    backgroundColor: categoryTheme.accentSoft,
    borderWidth: 1,
    borderColor: categoryTheme.accent,
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnText: {
    color: categoryTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
})

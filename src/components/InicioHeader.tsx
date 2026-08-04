import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import type { Locale } from '../data/mock'

import { BrandAssets } from '@/lib/brandAssets'

type Props = {
  city: string
  weather: string
  locale: Locale
  onToggleLocale: () => void
  onPressNotifications?: () => void
}

export const InicioHeader = memo(function InicioHeader({
  city,
  weather,
  locale,
  onToggleLocale,
  onPressNotifications,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Image source={BrandAssets.logoT} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.brand}>Trivai</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onPressNotifications}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={onToggleLocale}
            style={({ pressed }) => [styles.langTrack, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Idioma"
          >
            <View style={[styles.langPill, locale === 'ES' && styles.langPillActive]}>
              <Text style={[styles.langText, locale === 'ES' && styles.langTextActive]}>ES</Text>
            </View>
            <View style={[styles.langPill, locale === 'EN' && styles.langPillActive]}>
              <Text style={[styles.langText, locale === 'EN' && styles.langTextActive]}>EN</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <Text style={styles.city} numberOfLines={2}>
        {city}
      </Text>
      <Text style={styles.weather} numberOfLines={2}>
        {weather}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 1,
    minWidth: 0,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.soft,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  brand: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  city: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.3,
    paddingRight: spacing.sm,
  },
  weather: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  langTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    padding: 3,
    gap: 2,
  },
  langPill: {
    minWidth: 32,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  langPillActive: {
    backgroundColor: colors.card,
    ...shadows.soft,
  },
  langText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    opacity: 0.8,
  },
})

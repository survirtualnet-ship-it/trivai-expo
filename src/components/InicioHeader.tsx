import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../theme'
import type { Locale } from '../data/mock'

const logoSource = require('../../assets/T.png')

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
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.cityBlock}>
            <Text style={styles.brand}>Trivai</Text>
            <Text style={styles.city}>{city}</Text>
          </View>
        </View>
        <Text style={styles.weather}>{weather}</Text>
      </View>

      <View style={styles.right}>
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
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  left: {
    flex: 1,
    gap: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    width: 28,
    height: 28,
  },
  cityBlock: {
    gap: 2,
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
  },
  weather: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    paddingLeft: 52,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    minWidth: 36,
    height: 30,
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
    fontSize: fontSize.captionLg,
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

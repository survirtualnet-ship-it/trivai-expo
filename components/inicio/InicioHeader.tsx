import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { I, SP, RD } from '@/lib/inicio/theme'
import type { InicioLocale } from '@/lib/inicio/mockData'
import { FONT } from '@/lib/typography'

type Props = {
  city: string
  weather: string
  locale: InicioLocale
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
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.weather}>{weather}</Text>
      </View>
      <View style={styles.right}>
        <Pressable
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color={I.text} />
        </Pressable>
        <Pressable
          onPress={onToggleLocale}
          style={({ pressed }) => [styles.langBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Language"
        >
          <Text style={[styles.lang, locale === 'ES' && styles.langActive]}>ES</Text>
          <Text style={styles.langSep}>/</Text>
          <Text style={[styles.lang, locale === 'EN' && styles.langActive]}>EN</Text>
        </Pressable>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP.lg,
    paddingTop: SP.sm,
    paddingBottom: SP.md,
    gap: SP.md,
    backgroundColor: I.bg,
  },
  left: {
    flex: 1,
    gap: SP.xs,
  },
  city: {
    fontFamily: FONT.semibold,
    fontSize: 28,
    fontWeight: '600',
    color: I.text,
    letterSpacing: -0.6,
  },
  weather: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: I.textSecondary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RD.full,
    backgroundColor: I.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: I.fill,
    borderRadius: RD.full,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    gap: SP.xs,
  },
  lang: {
    fontFamily: FONT.medium,
    fontSize: 13,
    fontWeight: '500',
    color: I.textSecondary,
  },
  langActive: {
    color: I.accent,
    fontFamily: FONT.semibold,
    fontWeight: '600',
  },
  langSep: {
    color: I.textTertiary,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.75,
  },
})

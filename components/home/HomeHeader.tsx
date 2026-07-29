import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Bell } from 'lucide-react-native'
import { H } from '@/lib/home/theme'
import type { HomeContext, HomeLocale } from '@/lib/home/types'
import { FONT } from '@/lib/typography'

type Props = {
  context: HomeContext
  userName: string
  onToggleLocale: () => void
  onPressNotifications?: () => void
}

function greetingCopy(locale: HomeLocale, name: string) {
  if (locale === 'EN') {
    return {
      hello: `Hi, ${name} 👋`,
      ask: 'What do you want to explore today?',
    }
  }
  return {
    hello: `Hola, ${name} 👋`,
    ask: '¿Qué quieres explorar hoy?',
  }
}

export const HomeHeader = memo(function HomeHeader({
  context,
  userName,
  onToggleLocale,
  onPressNotifications,
}: Props) {
  const copy = greetingCopy(context.locale, userName)

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.city} numberOfLines={1}>
          📍 {context.city}
        </Text>
        <View style={styles.topRight}>
          <Pressable
            onPress={onToggleLocale}
            style={({ pressed }) => [styles.langToggle, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Language ${context.locale}`}
          >
            <Text style={[styles.langOpt, context.locale === 'ES' && styles.langActive]}>ES</Text>
            <Text style={styles.langSep}>/</Text>
            <Text style={[styles.langOpt, context.locale === 'EN' && styles.langActive]}>EN</Text>
          </Pressable>
          <Pressable
            onPress={onPressNotifications}
            style={({ pressed }) => [styles.bellBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={8}
          >
            <Bell size={20} color={H.text} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {context.weatherEmoji} {context.temperatureC}°C
        </Text>
        <View style={styles.metaDot} />
        <Text style={styles.meta} numberOfLines={1}>
          💱 1 USD = {context.usdToBob.toFixed(2)} BOB
        </Text>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={styles.hello}>{copy.hello}</Text>
        <Text style={styles.ask}>{copy.ask}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: H.bg,
    paddingHorizontal: H.padX,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: H.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  city: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: H.text,
    letterSpacing: -0.2,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: H.searchBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  langOpt: {
    fontFamily: FONT.medium,
    fontSize: 12,
    fontWeight: '500',
    color: H.textSecondary,
  },
  langActive: {
    fontFamily: FONT.semibold,
    fontWeight: '600',
    color: H.accent,
  },
  langSep: {
    fontSize: 12,
    color: H.textSecondary,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: H.searchBg,
  },
  pressed: {
    opacity: 0.75,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: H.textSecondary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: H.border,
  },
  greetingBlock: {
    gap: 4,
    paddingBottom: 8,
  },
  hello: {
    fontFamily: FONT.semibold,
    fontSize: 26,
    fontWeight: '600',
    color: H.text,
    letterSpacing: -0.6,
  },
  ask: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: H.textSecondary,
    letterSpacing: -0.2,
  },
})

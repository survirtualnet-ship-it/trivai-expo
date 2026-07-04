import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native'
import { Bell, User } from 'lucide-react-native'
import { HeaderLogo } from '@/components/ui/AppHeader'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import {
  DISCOVER_STRINGS,
  formatCityDateLine,
  type AppLocale,
} from '@/lib/i18n/discover'

type Props = {
  cityName: string
  locale: AppLocale
  isAuthenticated: boolean
  notifCount?: number
  onLocaleChange: (locale: AppLocale) => void
  onSignIn: () => void
  onSignOut: () => void
  onNotifPress: () => void
}

export function DiscoverHeader({
  cityName,
  locale,
  isAuthenticated,
  notifCount = 0,
  onLocaleChange,
  onSignIn,
  onSignOut,
  onNotifPress,
}: Props) {
  const t = DISCOVER_STRINGS[locale]
  const flag = locale === 'es' ? '🇧🇴' : '🇺🇸'

  const openLanguageMenu = () => {
    Alert.alert(t.language, undefined, [
      { text: `🇧🇴 ${t.languageEs}`, onPress: () => onLocaleChange('es') },
      { text: `🇺🇸 ${t.languageEn}`, onPress: () => onLocaleChange('en') },
      { text: t.cancel, style: 'cancel' },
    ])
  }

  const openHelp = () => {
    Linking.openURL('mailto:survirtualnet@gmail.com?subject=Soporte%20Trivai')
  }

  const openUserMenu = () => {
    const actions: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = []

    if (isAuthenticated) {
      actions.push({
        text: t.signOut,
        style: 'destructive',
        onPress: () => {
          Alert.alert(t.signOut, t.signOutConfirm, [
            { text: t.cancel, style: 'cancel' },
            { text: t.signOut, style: 'destructive', onPress: onSignOut },
          ])
        },
      })
    } else {
      actions.push({ text: t.signIn, onPress: onSignIn })
    }

    actions.push({ text: t.help, onPress: openHelp })
    actions.push({ text: t.cancel, style: 'cancel' })

    Alert.alert(t.userMenu, undefined, actions)
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.sideLeft}>
          <HeaderLogo height={32} />
        </View>

        <View style={styles.centerCol}>
          <Text style={styles.locationLine} numberOfLines={2}>
            {formatCityDateLine(cityName, locale)}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={openLanguageMenu} activeOpacity={0.85}>
            <Text style={styles.flag}>{flag}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={openUserMenu} activeOpacity={0.85}>
            <User size={20} color={T.fg2} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onNotifPress} activeOpacity={0.85}>
            <Bell size={20} color={notifCount > 0 ? T.primary : T.fg2} />
            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    backgroundColor: T.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: S.sm,
  },
  sideLeft: {
    width: 118,
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.xs,
  },
  locationLine: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    fontWeight: F.weight.medium,
    color: T.fg2,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: 118,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: S.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: R.full,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  flag: {
    fontSize: 22,
    lineHeight: 26,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: T.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: FONT.bold,
    fontWeight: F.weight.bold,
    color: '#fff',
  },
})

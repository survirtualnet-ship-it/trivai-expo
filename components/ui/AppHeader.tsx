import { View, Text, TouchableOpacity, Image, StyleSheet, type ReactNode } from 'react-native'
import { Bell } from 'lucide-react-native'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  /** Saludo personalizado — modo Discover */
  greeting?: string
  subtitle?: string
  /** Título fijo — modo pantallas secundarias */
  title?: string
  left?: ReactNode
  right?: ReactNode
  onNotifPress?: () => void
  notifCount?: number
}

export function AppHeader({ greeting, subtitle, title, left, right, onNotifPress, notifCount = 0 }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>
        <View style={styles.center}>
          {greeting ? (
            <>
              <Text style={styles.greeting}>{greeting}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </>
          ) : title ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
        </View>
        <View style={[styles.side, styles.sideRight]}>
          {right ?? (onNotifPress ? (
            <TouchableOpacity style={styles.iconBtn} onPress={onNotifPress} activeOpacity={0.8}>
              <Bell size={20} color={notifCount > 0 ? T.primary : T.fg2} />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifCount > 9 ? '9+' : notifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : null)}
        </View>
      </View>
    </View>
  )
}

export function HeaderLogo({ onPress, height = 36 }: { onPress?: () => void; height?: number }) {
  const width = Math.round(height * (151 / 43))
  const image = (
    <Image
      source={require('../../assets/logo-trivai.png')}
      style={{ height, width }}
      resizeMode="contain"
      accessibilityLabel="Trivai"
    />
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {image}
      </TouchableOpacity>
    )
  }
  return image
}

export function ProfileAvatar({
  initials, avatarUrl, size = 44, onPress,
}: {
  initials: string
  avatarUrl: string | null
  size?: number
  onPress?: () => void
}) {
  const inner = avatarUrl
    ? <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    : <Text style={[styles.ini, { fontSize: size * 0.34 }]}>{initials}</Text>

  const box = (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {inner}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {box}
      </TouchableOpacity>
    )
  }
  return box
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    backgroundColor: T.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  side: {
    width: 52,
    paddingTop: 4,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    paddingHorizontal: S.sm,
    justifyContent: 'center',
  },
  greeting: {
    fontFamily: FONT.bold,
    fontSize: F.size.h1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.fg3,
    marginTop: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
    letterSpacing: -0.3,
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
  avatar: {
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: T.surface,
    ...SHADOW.sm,
  },
  ini: {
    fontFamily: FONT.bold,
    fontWeight: F.weight.bold,
    color: T.primary,
  },
})

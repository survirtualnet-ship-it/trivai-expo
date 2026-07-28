import { memo, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { ProfileAvatar } from '@/components/ui/AppHeader'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  location: string
  subtitle?: string
  initials?: string
  avatarUrl?: string | null
  onLocationPress?: () => void
  onProfilePress?: () => void
  left?: ReactNode
  right?: ReactNode
}

export const Header = memo(function Header({
  location,
  subtitle,
  initials = '?',
  avatarUrl = null,
  onLocationPress,
  onProfilePress,
  left,
  right,
}: Props) {
  const locationBlock = (
    <View style={styles.locationCol}>
      <View style={styles.locationRow}>
        <MapPin size={14} color={T.accent} strokeWidth={2.5} />
        <Text style={styles.location} numberOfLines={1}>{location}</Text>
      </View>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      ) : null}
    </View>
  )

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>

        {onLocationPress ? (
          <TouchableOpacity style={styles.center} onPress={onLocationPress} activeOpacity={0.85}>
            {locationBlock}
          </TouchableOpacity>
        ) : (
          <View style={styles.center}>{locationBlock}</View>
        )}

        <View style={styles.sideRight}>
          {right ?? (
            <ProfileAvatar
              initials={initials}
              avatarUrl={avatarUrl}
              size={44}
              onPress={onProfilePress}
            />
          )}
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    backgroundColor: T.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: S.sm,
  },
  side: {
    minWidth: 44,
    justifyContent: 'center',
  },
  sideRight: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCol: {
    alignItems: 'center',
    gap: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  location: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg3,
  },
})

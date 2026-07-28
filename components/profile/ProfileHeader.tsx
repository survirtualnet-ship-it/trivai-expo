import { memo } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  name: string
  subtitle?: string
  initials: string
  avatarUrl?: string | null
}

export const ProfileHeader = memo(function ProfileHeader({
  name,
  subtitle,
  initials,
  avatarUrl,
}: Props) {
  return (
    <View style={styles.wrap}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.initials}>{initials.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: S.xl,
    paddingBottom: S.xxl,
    paddingHorizontal: S.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONT.semibold,
    fontSize: 26,
    fontWeight: F.weight.semibold,
    color: T.fg2,
  },
  name: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    marginTop: S.md,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    marginTop: 4,
    textAlign: 'center',
  },
})

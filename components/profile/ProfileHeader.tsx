import { memo } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { MapPin } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  name: string
  city: string
  initials: string
  avatarUrl?: string | null
}

export const ProfileHeader = memo(function ProfileHeader({
  name,
  city,
  initials,
  avatarUrl,
}: Props) {
  return (
    <View style={styles.wrap}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
      )}

      <Text style={styles.name}>{name}</Text>

      <View style={styles.cityRow}>
        <MapPin size={14} color={T.fg3} />
        <Text style={styles.city}>{city}</Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: S.xxl,
    paddingHorizontal: S.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONT.bold,
    fontSize: 28,
    fontWeight: F.weight.bold,
    color: T.primary,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: F.size.h1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    marginTop: S.lg,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: S.sm,
  },
  city: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
})

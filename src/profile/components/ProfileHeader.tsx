import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'
import { ModeIndicator } from './ModeIndicator'

export const ProfileHeader = memo(function ProfileHeader() {
  const user = useProfileStore(s => s.user)

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.wrap}>
      <View style={styles.avatarRing}>
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <View style={styles.cityRow}>
        <Text style={styles.cityIcon}>📍</Text>
        <Text style={styles.city}>{user.city}</Text>
      </View>
      <ModeIndicator role={user.role} />
      <View style={styles.typePill}>
        <Text style={styles.typeText}>{user.travelerType}</Text>
      </View>
      {user.companyId ? (
        <View style={styles.companyBadge}>
          <Text style={styles.companyBadgeText}>Empresa verificada ✔️</Text>
        </View>
      ) : null}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: profileTheme.spacing.xxl,
    paddingHorizontal: profileTheme.spacing.lg,
    marginHorizontal: profileTheme.spacing.lg,
    marginTop: profileTheme.spacing.md,
    backgroundColor: profileTheme.surface,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    shadowColor: profileTheme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    gap: profileTheme.spacing.sm,
  },
  avatarRing: {
    padding: 3,
    borderRadius: profileTheme.radius.full,
    borderWidth: 2,
    borderColor: profileTheme.accent,
    marginBottom: profileTheme.spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: profileTheme.surfaceElevated,
  },
  name: {
    color: profileTheme.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.xs,
  },
  cityIcon: {
    fontSize: 14,
  },
  city: {
    color: profileTheme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  typePill: {
    marginTop: profileTheme.spacing.xs,
    paddingHorizontal: profileTheme.spacing.lg,
    paddingVertical: 8,
    borderRadius: profileTheme.radius.full,
    backgroundColor: profileTheme.accentSoft,
    borderWidth: 1,
    borderColor: profileTheme.accent,
  },
  typeText: {
    color: profileTheme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  companyBadge: {
    marginTop: profileTheme.spacing.xs,
    paddingHorizontal: profileTheme.spacing.lg,
    paddingVertical: 8,
    borderRadius: profileTheme.radius.full,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  companyBadgeText: {
    color: profileTheme.success,
    fontSize: 12,
    fontWeight: '700',
  },
})

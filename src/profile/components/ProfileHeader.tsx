import { memo, useMemo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { router } from 'expo-router'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'
import { ModeIndicator } from './ModeIndicator'
import { AppModeToggle } from '@/components/AppModeToggle'
import { useUser } from '@/hooks/useUser'

type Props = {
  /** Top behavioral signal — e.g. liked category. Hidden when empty. */
  signalLabel?: string | null
}

export const ProfileHeader = memo(function ProfileHeader({ signalLabel }: Props) {
  const storeUser = useProfileStore(s => s.user)
  const { isAuthenticated, displayName, avatarUrl, initials, user, profile } = useUser()

  const name = useMemo(() => {
    if (!isAuthenticated) return 'Invitado'
    return (
      storeUser.name?.trim() ||
      profile?.full_name?.trim() ||
      displayName ||
      'Explorador'
    )
  }, [isAuthenticated, storeUser.name, profile?.full_name, displayName])

  const city =
    storeUser.city?.trim() ||
    profile?.city?.trim() ||
    (isAuthenticated ? 'Ubicación no definida' : 'Inicia sesión para personalizar')

  const photo =
    (isAuthenticated && (storeUser.avatarUrl || avatarUrl)) ||
    `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
      initials || name || 'T',
    )}`

  return (
    <Animated.View entering={FadeInDown.duration(420).springify()} style={styles.wrap}>
      <View style={styles.avatarRing}>
        <Image source={{ uri: photo }} style={styles.avatar} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.cityRow}>
        <Text style={styles.cityIcon}>📍</Text>
        <Text style={styles.city}>{city}</Text>
      </View>

      {isAuthenticated ? (
        <>
          <ModeIndicator role={storeUser.role} companyId={storeUser.companyId} />
          {storeUser.companyId ? (
            <View style={styles.toggleWrap}>
              <AppModeToggle />
            </View>
          ) : null}
          {signalLabel ? (
            <View style={styles.typePill}>
              <Text style={styles.typeText}>{signalLabel}</Text>
            </View>
          ) : null}
          {storeUser.companyId ? (
            <View style={styles.companyBadge}>
              <Text style={styles.companyBadgeText}>Negocio reclamado</Text>
            </View>
          ) : null}
        </>
      ) : (
        <Pressable
          style={styles.loginBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginBtnText}>Iniciar sesión</Text>
        </Pressable>
      )}

      {isAuthenticated && user?.email ? (
        <Text style={styles.email}>{user.email}</Text>
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
  toggleWrap: {
    alignSelf: 'stretch',
    marginTop: profileTheme.spacing.xs,
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
  loginBtn: {
    marginTop: profileTheme.spacing.sm,
    backgroundColor: profileTheme.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: profileTheme.radius.full,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  email: {
    color: profileTheme.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
})

import { useCallback } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, router } from 'expo-router'
import { useUser } from '@/hooks/useUser'
import { useProfileStats } from '@/hooks/useProfileStats'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ProfileOptions } from '@/components/profile/ProfileOptions'
import { Button } from '@/components/ui/Button'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

function resolveFullName(
  profile: ReturnType<typeof useUser>['profile'],
  user: ReturnType<typeof useUser>['user'],
): string {
  const meta = user?.user_metadata ?? {}
  return (
    profile?.full_name ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Guest'
  )
}

export default function ProfileScreen() {
  const {
    profile,
    user,
    loading,
    isAuthenticated,
    initials,
    avatarUrl,
    refreshProfile,
  } = useUser()

  const { savedPlaces, visits, isLoading: statsLoading } = useProfileStats()

  useFocusEffect(
    useCallback(() => {
      refreshProfile()
    }, [refreshProfile]),
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    )
  }

  const name = resolveFullName(profile, user)
  const city = profile?.city?.trim() || 'Santa Cruz de la Sierra'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.screenTitle}>Perfil</Text>

        {!isAuthenticated ? (
          <View style={styles.guest}>
            <ProfileHeader
              name="Invitado"
              city="Santa Cruz de la Sierra"
              initials="?"
            />
            <Text style={styles.guestText}>
              Inicia sesión para guardar lugares y sincronizar tu perfil.
            </Text>
            <Button
              label="Iniciar sesión"
              variant="primary"
              onPress={() => router.push('/auth')}
              style={styles.guestBtn}
            />
          </View>
        ) : (
          <>
            <ProfileHeader
              name={name}
              city={city}
              initials={initials}
              avatarUrl={avatarUrl}
            />

            {statsLoading ? (
              <ActivityIndicator color={T.primary} style={styles.statsLoader} />
            ) : (
              <ProfileStats
                savedPlaces={savedPlaces}
                visits={visits}
                onSavedPress={() => router.push('/perfil/favoritos')}
              />
            )}

            <ProfileOptions
              onEditProfile={() => router.push('/perfil/editar')}
              onSettings={() => router.push('/perfil/configuracion')}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.bg,
  },
  scroll: {
    paddingBottom: 48,
  },
  screenTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    letterSpacing: -0.3,
  },
  guest: {
    alignItems: 'center',
    paddingHorizontal: S.xl,
  },
  guestText: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: S.lg,
  },
  guestBtn: {
    minWidth: 180,
  },
  statsLoader: {
    marginVertical: S.xl,
  },
})

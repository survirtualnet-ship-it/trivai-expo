import { useCallback, useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
  Pressable,
  Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, router } from 'expo-router'
import {
  UserRound,
  Heart,
  Settings,
  HelpCircle,
} from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { useProfileStats } from '@/hooks/useProfileStats'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { SettingsGroup, type SettingsRow } from '@/components/profile/ProfileOptions'
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
    'Invitado'
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
    signOut,
  } = useUser()

  const { savedPlaces } = useProfileStats()

  useFocusEffect(
    useCallback(() => {
      refreshProfile()
    }, [refreshProfile]),
  )

  const handleSignOut = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/auth')
        },
      },
    ])
  }, [signOut])

  const accountRows = useMemo((): SettingsRow[] => {
    if (!isAuthenticated) return []
    return [
      {
        key: 'edit',
        label: 'Editar perfil',
        iconBg: '#8E8E93',
        icon: <UserRound size={16} color="#fff" strokeWidth={2.2} />,
        onPress: () => router.push('/perfil/editar'),
      },
      {
        key: 'saved',
        label: 'Guardados',
        iconBg: T.danger,
        icon: <Heart size={16} color="#fff" strokeWidth={2.2} fill="#fff" />,
        value: savedPlaces > 0 ? String(savedPlaces) : undefined,
        onPress: () => router.push('/perfil/favoritos'),
      },
    ]
  }, [isAuthenticated, savedPlaces])

  const prefsRows = useMemo((): SettingsRow[] => ([
    {
      key: 'settings',
      label: 'Configuración',
      iconBg: T.fg3,
      icon: <Settings size={16} color="#fff" strokeWidth={2.2} />,
      onPress: () => router.push(
        isAuthenticated ? '/perfil/configuracion' : '/auth',
      ),
    },
    {
      key: 'help',
      label: 'Ayuda',
      iconBg: T.primary,
      icon: <HelpCircle size={16} color="#fff" strokeWidth={2.2} />,
      onPress: () => {
        Linking.openURL('mailto:survirtualnet@gmail.com?subject=Soporte%20Trivai')
      },
    },
  ]), [isAuthenticated])

  const authRows = useMemo((): SettingsRow[] => {
    if (isAuthenticated) {
      return [{
        key: 'signout',
        label: 'Cerrar sesión',
        destructive: true,
        onPress: handleSignOut,
      }]
    }
    return [{
      key: 'signin',
      label: 'Iniciar sesión',
      iconBg: T.primary,
      icon: <UserRound size={16} color="#fff" strokeWidth={2.2} />,
      onPress: () => router.push('/auth'),
    }]
  }, [isAuthenticated, handleSignOut])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.fg3} />
      </View>
    )
  }

  const name = isAuthenticated ? resolveFullName(profile, user) : 'Invitado'
  const subtitle = isAuthenticated
    ? (profile?.city?.trim() || user?.email || undefined)
    : 'Inicia sesión para sincronizar'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        <Text style={styles.screenTitle}>Perfil</Text>

        <ProfileHeader
          name={name}
          subtitle={subtitle}
          initials={isAuthenticated ? initials : '?'}
          avatarUrl={isAuthenticated ? avatarUrl : null}
        />

        {!isAuthenticated && (
          <Pressable
            onPress={() => router.push('/auth')}
            style={({ pressed }) => [styles.signInHint, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.signInHintText}>Iniciar sesión</Text>
          </Pressable>
        )}

        {accountRows.length > 0 && <SettingsGroup rows={accountRows} />}
        <SettingsGroup rows={prefsRows} />
        <SettingsGroup rows={authRows} />

        <Text style={styles.version}>Trivai</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.muted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.muted,
  },
  scroll: {
    paddingBottom: 56,
  },
  screenTitle: {
    fontFamily: FONT.semibold,
    fontSize: 34,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    paddingHorizontal: S.lg,
    paddingTop: S.sm,
    letterSpacing: -0.8,
  },
  signInHint: {
    alignSelf: 'center',
    marginBottom: S.xl,
  },
  signInHintText: {
    fontFamily: FONT.regular,
    fontSize: F.size.lg,
    color: T.primary,
  },
  version: {
    textAlign: 'center',
    fontFamily: FONT.regular,
    fontSize: F.size.xs,
    color: T.fg4,
    marginTop: S.md,
  },
})

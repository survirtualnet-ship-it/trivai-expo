import { memo, useCallback } from 'react'
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { LogOut } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { T } from '@/lib/tokens'
import { profileTheme } from '../theme'

export const LogoutSection = memo(function LogoutSection() {
  const { isAuthenticated: userAuth, signOut } = useUser()
  const storeAuth = useAuthStore(s => s.isAuthenticated)
  const isAuthenticated = storeAuth || userAuth

  const doLogout = useCallback(async () => {
    await signOut()
    router.replace('/welcome')
  }, [signOut])

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined' &&
        window.confirm('¿Estás seguro de que quieres cerrar sesión?')
      if (ok) void doLogout()
      return
    }

    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void doLogout()
        },
      },
    ])
  }, [doLogout])

  if (!isAuthenticated) return null

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          handleLogout()
        }}
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <LogOut size={18} color={T.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: profileTheme.spacing.lg,
    marginTop: profileTheme.spacing.md,
    marginBottom: profileTheme.spacing.sm,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: profileTheme.spacing.sm,
    paddingVertical: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  logoutText: {
    color: T.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
})

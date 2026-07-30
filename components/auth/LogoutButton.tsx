import { memo, useCallback } from 'react'
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { LogOut } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { T } from '@/lib/tokens'

type Variant = 'full' | 'nav'

type Props = {
  /** full = wide button; nav = compact top-bar link */
  variant?: Variant
  tone?: 'light' | 'dark'
}

/**
 * Shared logout control — always available on protected screens.
 * Falls back to store logout if useUser session is briefly stale.
 */
export const LogoutButton = memo(function LogoutButton({
  variant = 'full',
  tone = 'light',
}: Props) {
  const { signOut } = useUser()
  const storeLogout = useAuthStore(s => s.logout)

  const doLogout = useCallback(async () => {
    try {
      await signOut()
    } catch {
      await storeLogout()
    }
    router.replace('/welcome')
  }, [signOut, storeLogout])

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

  const onPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    handleLogout()
  }

  if (variant === 'nav') {
    const color = tone === 'dark' ? '#fff' : T.danger
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        hitSlop={8}
      >
        <LogOut size={16} color={color} />
        <Text style={[styles.navLabel, { color }]}>Salir</Text>
      </Pressable>
    )
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.fullBtn, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <LogOut size={18} color={T.danger} />
        <Text style={styles.fullLabel}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: T.dangerSoft,
    backgroundColor: T.dangerSoft,
  },
  fullLabel: {
    color: T.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 56,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
})

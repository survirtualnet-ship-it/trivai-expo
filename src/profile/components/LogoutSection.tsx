import { memo, useCallback } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { LogOut, Settings } from 'lucide-react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useUser } from '@/hooks/useUser'
import { T } from '@/lib/tokens'
import { profileTheme } from '../theme'

export const LogoutSection = memo(function LogoutSection() {
  const { isAuthenticated, signOut } = useUser()

  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/welcome')
        },
      },
    ])
  }, [signOut])

  if (!isAuthenticated) return null

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync()
          router.push('/perfil/configuracion')
        }}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <Settings size={18} color={profileTheme.textSecondary} />
        </View>
        <Text style={styles.rowLabel}>Configuración</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          handleLogout()
        }}
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
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
    gap: profileTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.md,
    backgroundColor: profileTheme.surface,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    paddingHorizontal: profileTheme.spacing.lg,
    paddingVertical: profileTheme.spacing.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: profileTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: profileTheme.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: profileTheme.spacing.sm,
    paddingVertical: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.25)',
    backgroundColor: 'rgba(239,68,68,0.08)',
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

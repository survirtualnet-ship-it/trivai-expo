import { memo, useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { BarChart3, Store } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'
import { useAppMode } from '@/src/appMode'
import { navigateToMyBusiness } from '../navigation/myBusiness'

export const MyBusinessSection = memo(function MyBusinessSection() {
  const user = useProfileStore(s => s.user)
  const hasCompany = Boolean(user.companyId)
  const { setMode } = useAppMode()

  const handleManage = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!user.companyId) {
      navigateToMyBusiness()
      return
    }
    // Stay in-app: switch mode + open the place where owner tools live
    setMode('business')
    router.push(`/place/${user.companyId}`)
  }, [setMode, user.companyId])

  const handleAdvanced = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    navigateToMyBusiness()
  }, [])

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handleManage}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <Store size={20} color={profileTheme.accent} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>
            {hasCompany ? 'Gestionar mi negocio' : 'Mi negocio'}
          </Text>
          <Text style={styles.subtitle}>
            {hasCompany
              ? 'Edita info y responde desde la ficha del lugar'
              : 'Registra tu empresa en Trivai'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      {hasCompany ? (
        <Pressable
          onPress={handleAdvanced}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <BarChart3 size={18} color={profileTheme.textSecondary} />
          <Text style={styles.secondaryText}>
            Panel avanzado · métricas y configuración
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: profileTheme.spacing.lg,
    marginBottom: profileTheme.spacing.lg,
    gap: profileTheme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.md,
    backgroundColor: profileTheme.surface,
    borderRadius: profileTheme.radius.lg,
    borderWidth: 1,
    borderColor: profileTheme.border,
    padding: profileTheme.spacing.lg,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: profileTheme.spacing.sm,
    paddingHorizontal: profileTheme.spacing.md,
    paddingVertical: profileTheme.spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: profileTheme.radius.md,
    backgroundColor: profileTheme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: profileTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: profileTheme.textSecondary,
    fontSize: 13,
  },
  secondaryText: {
    flex: 1,
    color: profileTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    color: profileTheme.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
})

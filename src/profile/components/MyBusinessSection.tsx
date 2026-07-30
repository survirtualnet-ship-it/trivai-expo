import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Store } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'
import { navigateToMyBusiness } from '../navigation/myBusiness'

export const MyBusinessSection = memo(function MyBusinessSection() {
  const user = useProfileStore(s => s.user)
  const hasCompany = Boolean(user.companyId)

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          navigateToMyBusiness()
        }}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        <View style={styles.iconWrap}>
          <Store size={20} color={profileTheme.accent} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>Mi negocio</Text>
          <Text style={styles.subtitle}>
            {hasCompany
              ? 'Administra tu perfil empresarial'
              : 'Registra tu empresa en Trivai'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: profileTheme.spacing.lg,
    marginBottom: profileTheme.spacing.lg,
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
  chevron: {
    color: profileTheme.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
})

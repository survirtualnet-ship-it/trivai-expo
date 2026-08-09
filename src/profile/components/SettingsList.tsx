import { memo } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'
import { useLocale } from '@/hooks/useLocale'
import { useCurrency } from '@/hooks/useCurrency'
import { useLocationProfile } from '@/hooks/useLocationProfile'

export const SettingsList = memo(function SettingsList() {
  const settings = useProfileStore(s => s.settings)
  const toggleNotifications = useProfileStore(s => s.toggleNotifications)
  const togglePrivacy = useProfileStore(s => s.togglePrivacy)
  const { locale } = useLocale()
  const { profile } = useLocationProfile()
  const currencyLocale = locale === 'en' ? 'EN' : 'ES'
  const { currency } = useCurrency(profile?.countryCode, currencyLocale)

  const languageLabel = locale === 'en' ? 'English' : 'Español'
  const currencyLabel = currency?.localCode || settings.currency || 'BOB'

  return (
    <View style={styles.card}>
      <SettingsRow label="Idioma" value={languageLabel} />
      <SettingsRow label="Moneda" value={currencyLabel} />
      <SettingsToggle
        label="Notificaciones"
        value={settings.notifications}
        onToggle={() => {
          void Haptics.selectionAsync()
          toggleNotifications()
        }}
      />
      <SettingsToggle
        label="Privacidad (local)"
        value={settings.privacy}
        onToggle={() => {
          void Haptics.selectionAsync()
          togglePrivacy()
        }}
      />
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync()
          router.push('/perfil/configuracion')
        }}
        style={({ pressed }) => [styles.row, styles.rowLast, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Más ajustes</Text>
        <Text style={styles.value}>Abrir →</Text>
      </Pressable>
      <Text style={styles.hint}>
        Los interruptores de arriba son solo en este dispositivo por ahora.
      </Text>
    </View>
  )
})

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

function SettingsToggle({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: profileTheme.surfaceElevated, true: profileTheme.accentSoft }}
        thumbColor={value ? profileTheme.accent : profileTheme.textMuted}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: profileTheme.spacing.lg,
    borderRadius: profileTheme.radius.lg,
    backgroundColor: profileTheme.surface,
    borderWidth: 1,
    borderColor: profileTheme.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: profileTheme.spacing.xl,
    paddingVertical: profileTheme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: profileTheme.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  pressed: {
    backgroundColor: profileTheme.surfaceElevated,
  },
  label: {
    color: profileTheme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    color: profileTheme.textSecondary,
    fontSize: 14,
  },
  hint: {
    paddingHorizontal: profileTheme.spacing.xl,
    paddingBottom: profileTheme.spacing.lg,
    color: profileTheme.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
})

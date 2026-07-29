import { memo } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { profileTheme } from '../theme'
import { useProfileStore } from '../store/useProfileStore'

export const SettingsList = memo(function SettingsList() {
  const settings = useProfileStore(s => s.settings)
  const toggleNotifications = useProfileStore(s => s.toggleNotifications)
  const togglePrivacy = useProfileStore(s => s.togglePrivacy)

  return (
    <View style={styles.card}>
      <SettingsRow label="Idioma" value={settings.language} />
      <SettingsRow label="Moneda" value={settings.currency} />
      <SettingsToggle
        label="Notificaciones"
        value={settings.notifications}
        onToggle={() => {
          void Haptics.selectionAsync()
          toggleNotifications()
        }}
      />
      <SettingsToggle
        label="Privacidad"
        value={settings.privacy}
        onToggle={() => {
          void Haptics.selectionAsync()
          togglePrivacy()
        }}
        last
      />
    </View>
  )
})

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <Pressable
      onPress={() => void Haptics.selectionAsync()}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  )
}

function SettingsToggle({
  label,
  value,
  onToggle,
  last,
}: {
  label: string
  value: boolean
  onToggle: () => void
  last?: boolean
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
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
})

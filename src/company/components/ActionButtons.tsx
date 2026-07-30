import { memo } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Globe, MapPin, MessageCircle, Phone } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { companyTheme as t } from '../theme'
import type { Company } from '../types'

type Props = {
  company: Company
}

export const ActionButtons = memo(function ActionButtons({ company }: Props) {
  const actions = [
    {
      key: 'call',
      label: 'Llamar',
      icon: Phone,
      onPress: () => Linking.openURL(`tel:${company.phone.replace(/\s/g, '')}`),
    },
    {
      key: 'wa',
      label: 'WhatsApp',
      icon: MessageCircle,
      onPress: () => {
        const digits = company.whatsapp.replace(/\D/g, '')
        Linking.openURL(`https://wa.me/${digits}`)
      },
    },
    {
      key: 'web',
      label: 'Web',
      icon: Globe,
      onPress: () => Linking.openURL(company.website),
    },
    {
      key: 'dir',
      label: 'Cómo llegar',
      icon: MapPin,
      onPress: () => {
        const { latitude, longitude } = company.location
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        )
      },
    },
  ] as const

  return (
    <View style={styles.row}>
      {actions.map(action => (
        <Pressable
          key={action.key}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            action.onPress()
          }}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <action.icon size={18} color={t.accent} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    marginTop: t.spacing.lg,
  },
  btn: {
    flexGrow: 1,
    minWidth: '22%',
    backgroundColor: t.surfaceMuted,
    borderRadius: t.radius.md,
    paddingVertical: 10,
    paddingHorizontal: t.spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: t.border,
  },
  label: {
    color: t.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
})

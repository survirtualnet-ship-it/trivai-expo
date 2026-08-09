import { memo } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Globe, MapPin, MessageCircle, Phone } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { companyTheme as t } from '../theme'
import type { Company } from '../types'

type Props = {
  company: Company
}

function openSafe(url: string | null) {
  if (!url) return
  void Linking.openURL(url)
}

export const ActionButtons = memo(function ActionButtons({ company }: Props) {
  const phone = company.phone?.trim() || ''
  const whatsapp = company.whatsapp?.trim() || phone
  const website = company.website?.trim() || ''

  const actions = [
    {
      key: 'call',
      label: 'Llamar',
      icon: Phone,
      onPress: () => {
        if (!phone) return
        openSafe(`tel:${phone.replace(/\s/g, '')}`)
      },
    },
    {
      key: 'wa',
      label: 'WhatsApp',
      icon: MessageCircle,
      onPress: () => {
        const digits = whatsapp.replace(/\D/g, '')
        if (!digits) return
        openSafe(`https://wa.me/${digits}`)
      },
    },
    {
      key: 'web',
      label: 'Web',
      icon: Globe,
      onPress: () => {
        if (!website) return
        const href = /^https?:\/\//i.test(website) ? website : `https://${website}`
        openSafe(href)
      },
    },
    {
      key: 'dir',
      label: 'Cómo llegar',
      icon: MapPin,
      onPress: () => {
        const { latitude, longitude } = company.location ?? { latitude: 0, longitude: 0 }
        if (!latitude && !longitude) return
        openSafe(
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

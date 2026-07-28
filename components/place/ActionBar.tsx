import { memo, type ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Navigation, Bookmark } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  isFavorite: boolean
  favoritePending?: boolean
  showWhatsApp?: boolean
  onDirections: () => void
  onWhatsApp?: () => void
  onSave: () => void
}

async function tapHaptic() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  } catch { /* web */ }
}

function WhatsAppIcon() {
  return (
    <View style={styles.waIcon}>
      <Text style={styles.waGlyph}>W</Text>
    </View>
  )
}

export const ActionBar = memo(function ActionBar({
  isFavorite,
  favoritePending,
  showWhatsApp = true,
  onDirections,
  onWhatsApp,
  onSave,
}: Props) {
  const wrap = (fn: () => void) => () => {
    tapHaptic()
    fn()
  }

  return (
    <View style={styles.wrap}>
      <ActionBtn
        icon={<Navigation size={22} color="#fff" />}
        label="Cómo llegar"
        primary
        onPress={wrap(onDirections)}
      />
      {showWhatsApp && onWhatsApp && (
        <ActionBtn
          icon={<WhatsAppIcon />}
          label="WhatsApp"
          whatsapp
          onPress={wrap(onWhatsApp)}
        />
      )}
      <ActionBtn
        icon={
          favoritePending
            ? <ActivityIndicator size="small" color={T.primary} />
            : <Bookmark size={22} color={isFavorite ? T.primary : T.fg1} fill={isFavorite ? T.primary : 'transparent'} />
        }
        label={isFavorite ? 'Guardado' : 'Guardar'}
        onPress={wrap(onSave)}
        disabled={favoritePending}
      />
    </View>
  )
})

function ActionBtn({
  icon,
  label,
  onPress,
  primary,
  whatsapp,
  disabled,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
  primary?: boolean
  whatsapp?: boolean
  disabled?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        primary && styles.btnPrimary,
        whatsapp && styles.btnWhatsApp,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      {icon}
      <Text
        style={[
          styles.btnLabel,
          primary && styles.btnLabelPrimary,
          whatsapp && styles.btnLabelWhatsApp,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const WA_GREEN = '#25D366'

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
    backgroundColor: T.surface,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: S.md,
    paddingHorizontal: S.sm,
    borderRadius: R.xl,
    backgroundColor: T.bg,
    minHeight: 72,
    borderWidth: 1.5,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  btnPrimary: {
    backgroundColor: T.primary,
    borderColor: T.primary,
    ...SHADOW.md,
  },
  btnWhatsApp: {
    backgroundColor: '#E8FBF0',
    borderColor: WA_GREEN,
  },
  btnLabel: {
    fontFamily: FONT.bold,
    fontSize: F.size.xs,
    color: T.fg1,
    textAlign: 'center',
  },
  btnLabelPrimary: {
    color: '#fff',
  },
  btnLabelWhatsApp: {
    color: '#128C4B',
  },
  waIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: WA_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waGlyph: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#fff',
  },
})

import { memo, type ComponentType } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronRight, Pencil, Settings } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Option = {
  label: string
  Icon: ComponentType<{ size: number; color: string; strokeWidth?: number }>
  onPress: () => void
}

type Props = {
  onEditProfile: () => void
  onSettings: () => void
}

export const ProfileOptions = memo(function ProfileOptions({
  onEditProfile,
  onSettings,
}: Props) {
  const options: Option[] = [
    { label: 'Editar perfil', Icon: Pencil, onPress: onEditProfile },
    { label: 'Configuración', Icon: Settings, onPress: onSettings },
  ]

  return (
    <View style={styles.wrap}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.label}
          style={[styles.row, i < options.length - 1 && styles.rowBorder]}
          onPress={opt.onPress}
          activeOpacity={0.75}
        >
          <View style={styles.iconWrap}>
            <opt.Icon size={18} color={T.fg2} strokeWidth={2} />
          </View>
          <Text style={styles.label}>{opt.label}</Text>
          <ChevronRight size={18} color={T.fg4} />
        </TouchableOpacity>
      ))}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.xxl,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingHorizontal: S.lg,
    paddingVertical: S.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: R.md,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
})

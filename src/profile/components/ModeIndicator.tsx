import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Briefcase, Compass } from 'lucide-react-native'
import { profileTheme } from '../theme'
import { useAppMode } from '@/src/appMode'
import { isBusinessUser, type UserRole } from '@/lib/domain/user'

type Props = {
  role: UserRole
  companyId?: string
}

/** Static role hint for tourists; company users see live explore/business mode. */
export const ModeIndicator = memo(function ModeIndicator({
  role,
  companyId,
}: Props) {
  const { mode } = useAppMode()
  const isEmpresa = isBusinessUser(role) || !!companyId

  if (isEmpresa) {
    const business = mode === 'business'
    return (
      <View style={[styles.wrap, business ? styles.company : styles.tourist]}>
        {business ? (
          <Briefcase size={13} color={profileTheme.success} />
        ) : (
          <Compass size={13} color={profileTheme.accent} />
        )}
        <Text
          style={[
            styles.label,
            business ? styles.companyLabel : styles.touristLabel,
          ]}
        >
          {business ? 'Modo empresa activo' : 'Modo explorar'}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.wrap, styles.tourist]}>
      <Compass size={13} color={profileTheme.accent} />
      <Text style={[styles.label, styles.touristLabel]}>Modo explorar</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: profileTheme.spacing.md,
    paddingVertical: 7,
    borderRadius: profileTheme.radius.full,
    borderWidth: 1,
  },
  tourist: {
    backgroundColor: profileTheme.accentSoft,
    borderColor: profileTheme.accent,
  },
  company: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: 'rgba(52,211,153,0.35)',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  touristLabel: {
    color: profileTheme.text,
  },
  companyLabel: {
    color: profileTheme.success,
  },
})

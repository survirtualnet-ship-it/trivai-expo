import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Briefcase, Compass } from 'lucide-react-native'
import { profileTheme } from '../theme'
import type { UserRole } from '../store/useProfileStore'

type Props = {
  role: UserRole
}

export const ModeIndicator = memo(function ModeIndicator({ role }: Props) {
  const isCompany = role === 'company'

  return (
    <View style={[styles.wrap, isCompany ? styles.company : styles.tourist]}>
      {isCompany ? (
        <Briefcase size={13} color={profileTheme.success} />
      ) : (
        <Compass size={13} color={profileTheme.accent} />
      )}
      <Text style={[styles.label, isCompany ? styles.companyLabel : styles.touristLabel]}>
        {isCompany ? 'Modo Empresa' : 'Modo Turista'}
      </Text>
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

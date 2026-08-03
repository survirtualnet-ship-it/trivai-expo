import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

export const AuthDivider = memo(function AuthDivider({ label = 'o' }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginVertical: t.spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.border,
  },
  label: {
    fontSize: t.font.caption,
    color: t.textMuted,
    fontWeight: '500',
  },
})

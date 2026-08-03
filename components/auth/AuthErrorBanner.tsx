import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

export const AuthErrorBanner = memo(function AuthErrorBanner({ message }: { message: string }) {
  if (!message) return null
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderWidth: 1,
    borderColor: t.accentSecondary,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
  },
  text: {
    fontSize: t.font.caption,
    color: t.accentSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
})

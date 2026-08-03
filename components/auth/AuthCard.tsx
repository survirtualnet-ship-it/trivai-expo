import { memo, type ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const AuthCard = memo(function AuthCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    padding: t.spacing.xl,
    borderWidth: 1,
    borderColor: t.border,
    gap: t.spacing.lg,
  },
})

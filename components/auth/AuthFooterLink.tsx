import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = {
  prefix: string
  linkLabel: string
  onPress: () => void
}

export const AuthFooterLink = memo(function AuthFooterLink({
  prefix,
  linkLabel,
  onPress,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>{prefix}</Text>
      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={styles.link}>{linkLabel}</Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: t.spacing.md,
    gap: t.spacing.xs,
  },
  prefix: {
    fontSize: t.font.body,
    color: t.textSecondary,
  },
  link: {
    fontSize: t.font.body,
    fontWeight: '700',
    color: t.accent,
  },
})

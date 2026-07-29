import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { profileTheme } from '../theme'

type Props = {
  title: string
  subtitle?: string
}

export const SectionHeader = memo(function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: profileTheme.spacing.lg,
    paddingTop: profileTheme.spacing.xxl,
    paddingBottom: profileTheme.spacing.md,
    gap: profileTheme.spacing.xs,
  },
  title: {
    color: profileTheme.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: profileTheme.textSecondary,
    fontSize: 13,
  },
})

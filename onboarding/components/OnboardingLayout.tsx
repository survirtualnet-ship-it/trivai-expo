import { memo, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { onboardingTheme as t } from '../lib/theme'

type Props = {
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
}

export const OnboardingLayout = memo(function OnboardingLayout({
  title,
  subtitle,
  children,
  footer,
  centered = false,
}: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={[styles.body, centered && styles.centered]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xxl,
  },
  centered: {
    justifyContent: 'center',
  },
  title: {
    color: t.text,
    fontSize: t.font.title,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: t.spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: t.font.subtitle,
    lineHeight: 24,
    marginBottom: t.spacing.xl,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: t.spacing.xl,
    paddingBottom: t.spacing.lg,
    gap: t.spacing.md,
  },
})

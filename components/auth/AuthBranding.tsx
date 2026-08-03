import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { BrandAssets } from '@/lib/brandAssets'
import { onboardingTheme as t } from '@/onboarding/lib/theme'

type Props = {
  title: string
  subtitle: string
}

export const AuthBranding = memo(function AuthBranding({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoBadge}>
        <Image
          source={BrandAssets.logoT}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Trivai"
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: t.spacing.sm,
    gap: t.spacing.md,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    color: t.text,
    fontSize: t.font.title,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: t.spacing.sm,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: t.font.subtitle,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: t.spacing.sm,
  },
})

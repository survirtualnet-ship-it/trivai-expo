import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { BrandAssets } from '@/lib/brandAssets'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  subtitle: string
}

export const AuthBranding = memo(function AuthBranding({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoWrap}>
        <Image
          source={BrandAssets.logoMark}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Trivai"
        />
      </View>
      <Text style={styles.brand}>Trivai</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: S.md,
    paddingBottom: S.xl,
    gap: S.sm,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: R.md,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.xs,
    ...SHADOW.sm,
  },
  logo: {
    width: 36,
    height: 36,
  },
  brand: {
    fontFamily: FONT.bold,
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.primary,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.h1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: S.xs,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: S.lg,
  },
})

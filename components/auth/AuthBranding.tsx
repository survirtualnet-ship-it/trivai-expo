import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { BrandAssets } from '@/lib/brandAssets'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  title: string
  subtitle: string
}

export const AuthBranding = memo(function AuthBranding({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Image
        source={BrandAssets.logoTrivai}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Trivai"
      />
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
    gap: S.md,
  },
  logo: {
    width: 220,
    height: 88,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.h1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: S.lg,
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

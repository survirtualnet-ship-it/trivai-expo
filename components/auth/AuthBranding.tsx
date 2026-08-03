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
    paddingBottom: S.md,
    gap: S.md,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: R.lg,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.h1,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: S.sm,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: S.sm,
    marginTop: -S.xs,
  },
})

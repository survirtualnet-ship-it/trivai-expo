import { memo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { router } from 'expo-router'
import { BrandAssets } from '@/lib/brandAssets'
import { planBadgeLabel } from '@/lib/business/planOptions'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { T, F, S, R, SHADOW } from '@/lib/tokens'

type Props = {
  businessName: string
  logoUrl: string
  tier: BusinessSubscriptionTier
  isVerified?: boolean
  onPressNotifications?: () => void
  onPressLogo?: () => void
  logoChangeBlocked?: boolean
}

export const BusinessHomeHeader = memo(function BusinessHomeHeader({
  businessName,
  logoUrl,
  tier,
  isVerified,
  onPressNotifications,
  onPressLogo,
  logoChangeBlocked,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.trivaiLogo}>
            <Image source={BrandAssets.logoT} style={styles.trivaiLogoImg} resizeMode="contain" />
          </View>
          <Text style={styles.brandLabel}>Trivai</Text>
        </View>
        <Pressable
          onPress={onPressNotifications}
          style={({ pressed }) => [styles.notifBtn, pressed && styles.pressed]}
          accessibilityLabel="Notificaciones"
        >
          <Feather name="bell" size={20} color={T.fg1} />
        </Pressable>
      </View>

      <View style={styles.businessRow}>
        <Pressable onPress={onPressLogo} style={({ pressed }) => [pressed && styles.pressed]}>
          <Image source={{ uri: logoUrl }} style={styles.businessLogo} />
        </Pressable>
        <View style={styles.businessMeta}>
          <Text style={styles.businessName} numberOfLines={2}>
            {businessName}
          </Text>
          {isVerified ? (
            <View style={styles.verifiedRow}>
              <Feather name="check-circle" size={14} color={T.green} />
              <Text style={styles.verifiedText}>Empresa verificada</Text>
            </View>
          ) : null}
          <View style={styles.planPill}>
            <Text style={styles.planText}>Plan {planBadgeLabel(tier)}</Text>
          </View>
        </View>
      </View>

      {logoChangeBlocked ? (
        <Pressable
          style={styles.logoHint}
          onPress={() => router.push('/empresa/suscripcion' as never)}
        >
          <Text style={styles.logoHintTitle}>Cambiar logo</Text>
          <Text style={styles.logoHintSub}>Disponible en Plan PRO</Text>
        </Pressable>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: S.lg,
    paddingTop: S.xl,
    paddingBottom: S.md,
    gap: S.md,
    backgroundColor: T.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  trivaiLogo: {
    width: 36,
    height: 36,
    borderRadius: R.md,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  trivaiLogoImg: { width: 28, height: 28 },
  brandLabel: {
    fontSize: F.size.sm,
    fontWeight: '700',
    color: T.purple,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: R.full,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
  },
  businessLogo: {
    width: 64,
    height: 64,
    borderRadius: R.lg,
    backgroundColor: T.muted,
    borderWidth: 2,
    borderColor: T.border,
  },
  businessMeta: { flex: 1, gap: 4 },
  businessName: {
    fontSize: F.size.xxl,
    fontWeight: '800',
    color: T.fg1,
    letterSpacing: -0.3,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: F.size.sm,
    fontWeight: '600',
    color: T.greenInk,
  },
  planPill: {
    alignSelf: 'flex-start',
    backgroundColor: T.purpleSoft,
    paddingHorizontal: S.md,
    paddingVertical: 4,
    borderRadius: R.full,
    marginTop: 2,
  },
  planText: {
    fontSize: F.size.sm,
    fontWeight: '700',
    color: T.purple,
  },
  logoHint: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    opacity: 0.85,
  },
  logoHintTitle: {
    fontSize: F.size.md,
    fontWeight: '700',
    color: T.fg2,
  },
  logoHintSub: {
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 2,
  },
  pressed: { opacity: 0.88 },
})

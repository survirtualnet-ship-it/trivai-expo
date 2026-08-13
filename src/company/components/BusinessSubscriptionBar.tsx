import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Building2 } from 'lucide-react-native'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { planBadgeLabel, planManageActionLabel } from '@/lib/business/planOptions'
import { companyTheme as t } from '../theme'

type Props = {
  placeId: string
  businessName?: string
  tier: BusinessSubscriptionTier
}

/** Owner banner: claim status + current plan + manage CTA. */
export function BusinessSubscriptionBar({ placeId, businessName, tier }: Props) {
  if (tier === 'none') return null

  const actionLabel = planManageActionLabel(tier)

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Building2 size={18} color={t.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.claimed}>Empresa reclamada</Text>
        <Text style={styles.plan}>Plan {planBadgeLabel(tier)}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        onPress={() =>
          router.push({
            pathname: '/empresa/suscripcion',
            params: { placeId, name: businessName ?? '' },
          } as never)
        }
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.md,
    marginHorizontal: t.spacing.lg,
    marginBottom: t.spacing.sm,
    padding: t.spacing.md,
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: t.radius.md,
    backgroundColor: t.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  claimed: {
    color: t.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  plan: {
    color: t.text,
    fontSize: 15,
    fontWeight: '800',
  },
  action: {
    paddingHorizontal: t.spacing.md,
    paddingVertical: 8,
    borderRadius: t.radius.full,
    backgroundColor: t.accentSoft,
  },
  actionLabel: {
    color: t.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: { opacity: 0.9 },
})

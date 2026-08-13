import { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Check } from 'lucide-react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { updateBusinessSubscription } from '@/lib/business/businessPlan'
import { BUSINESS_PLAN_OPTIONS, type PlanOption } from '@/lib/business/planOptions'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { businessSubscriptionKeys } from '@/hooks/useBusinessSubscription'
import { ownedBusinessListKeys } from '@/hooks/useOwnedBusinessesList'
import { T, F, S, R, SHADOW } from '@/lib/tokens'

type Props = {
  placeId: string
  businessName?: string
  onComplete?: (
    placeId: string,
    tier: Exclude<BusinessSubscriptionTier, 'none'>,
  ) => void | Promise<void>
}

export function ChoosePlanScreen({ placeId, businessName, onComplete }: Props) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Exclude<BusinessSubscriptionTier, 'none'>>('free')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!user?.id || saving) return
    setSaving(true)
    setError(null)
    try {
      await updateBusinessSubscription({ placeId, tier: selected })
      await queryClient.invalidateQueries({
        queryKey: businessSubscriptionKeys.byPlace(placeId),
      })
      await queryClient.invalidateQueries({
        queryKey: ownedBusinessListKeys.byUser(user.id),
      })

      if (onComplete) {
        await onComplete(placeId, selected)
        return
      }

      router.replace(`/empresa/${placeId}`)
    } catch {
      setError('No pudimos guardar tu plan. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectPlan = (id: Exclude<BusinessSubscriptionTier, 'none'>) => {
    void Haptics.selectionAsync()
    setSelected(id)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Suscripción Trivai</Text>
        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>
          {businessName
            ? `${businessName} ya está reclamado. Elige un plan para activar herramientas (sin cobro por ahora).`
            : 'Tu negocio ya está reclamado. Elige un plan para activar herramientas (sin cobro por ahora).'}
        </Text>

        <View style={styles.cards}>
          {BUSINESS_PLAN_OPTIONS.map(option => (
            <PlanCard
              key={option.id}
              option={option}
              selected={selected === option.id}
              onSelect={() => handleSelectPlan(option.id)}
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
          onPress={() => void handleContinue()}
          disabled={saving}
        >
          <Text style={styles.continueLabel}>
            {saving ? 'Guardando…' : 'Continuar'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function PlanCard({
  option,
  selected,
  onSelect,
}: {
  option: PlanOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <View
      style={[
        styles.card,
        option.highlighted && styles.cardHighlight,
        selected && styles.cardSelected,
        SHADOW.sm,
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.planName}>{option.name}</Text>
          <Text style={styles.planPrice}>{option.priceLabel}</Text>
        </View>
        {selected ? (
          <View style={styles.check}>
            <Check size={16} color="#fff" strokeWidth={3} />
          </View>
        ) : null}
      </View>
      <Text style={styles.planDesc}>{option.description}</Text>
      {option.features.map(f => (
        <View key={f} style={styles.featureRow}>
          <Text style={styles.featureCheck}>✓</Text>
          <Text style={styles.feature}>{f}</Text>
        </View>
      ))}
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.selectBtn,
          selected && styles.selectBtnActive,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.selectLabel, selected && styles.selectLabelActive]}>
          {selected ? 'Plan seleccionado' : 'Seleccionar plan'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: {
    padding: S.xxl,
    paddingBottom: S.lg,
    gap: S.md,
  },
  kicker: {
    color: T.purple,
    fontSize: F.size.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: T.fg1,
    fontSize: F.size.h1,
    fontWeight: '800',
  },
  subtitle: {
    color: T.fg2,
    fontSize: F.size.lg,
    lineHeight: 22,
    marginBottom: S.sm,
  },
  cards: { gap: S.md },
  card: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 2,
    borderColor: T.border,
    padding: S.lg,
    gap: S.sm,
  },
  cardHighlight: { borderColor: 'rgba(108, 76, 241, 0.35)' },
  cardSelected: {
    borderColor: T.purple,
    backgroundColor: T.purpleSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: { color: T.fg1, fontSize: 18, fontWeight: '800' },
  planPrice: { color: T.fg2, fontSize: F.size.sm, marginTop: 2 },
  planDesc: { color: T.fg2, fontSize: F.size.sm, lineHeight: 18 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.sm,
  },
  featureCheck: {
    color: T.green,
    fontSize: F.size.md,
    fontWeight: '700',
    lineHeight: 20,
  },
  feature: { flex: 1, color: T.fg1, fontSize: F.size.md, lineHeight: 20 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: T.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtn: {
    marginTop: S.sm,
    paddingVertical: 12,
    borderRadius: R.full,
    borderWidth: 2,
    borderColor: T.purple,
    alignItems: 'center',
  },
  selectBtnActive: {
    backgroundColor: T.purple,
    borderColor: T.purple,
  },
  selectLabel: {
    color: T.purple,
    fontSize: F.size.md,
    fontWeight: '700',
  },
  selectLabelActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: S.xxl,
    paddingBottom: S.lg,
    paddingTop: S.sm,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.bg,
  },
  continueBtn: {
    backgroundColor: T.purple,
    borderRadius: R.full,
    paddingVertical: 16,
    alignItems: 'center',
    ...SHADOW.md,
  },
  continueLabel: {
    color: '#fff',
    fontSize: F.size.xl,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: T.dangerSoft,
    borderRadius: R.lg,
    padding: S.md,
  },
  errorText: { color: T.danger, fontSize: F.size.sm, textAlign: 'center' },
  pressed: { opacity: 0.92 },
})

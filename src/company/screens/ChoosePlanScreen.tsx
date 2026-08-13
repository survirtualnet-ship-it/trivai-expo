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
import { companyTheme as t } from '@/src/company/theme'

type Props = {
  placeId: string
  businessName?: string
  /** After plan saved — default: business dashboard */
  onComplete?: (placeId: string, tier: Exclude<BusinessSubscriptionTier, 'none'>) => void | Promise<void>
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
              onSelect={() => {
                void Haptics.selectionAsync()
                setSelected(option.id)
              }}
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
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        option.highlighted && styles.cardHighlight,
        selected && styles.cardSelected,
        pressed && styles.pressed,
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
        <Text key={f} style={styles.feature}>
          • {f}
        </Text>
      ))}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: {
    padding: t.spacing.xxl,
    paddingBottom: t.spacing.lg,
    gap: t.spacing.md,
  },
  kicker: {
    color: t.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: t.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: t.spacing.sm,
  },
  cards: { gap: t.spacing.md },
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 2,
    borderColor: t.border,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
  },
  cardHighlight: { borderColor: 'rgba(108, 76, 241, 0.35)' },
  cardSelected: {
    borderColor: t.accent,
    backgroundColor: t.accentSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: { color: t.text, fontSize: 18, fontWeight: '800' },
  planPrice: { color: t.textSecondary, fontSize: 13, marginTop: 2 },
  planDesc: { color: t.textSecondary, fontSize: 13, lineHeight: 18 },
  feature: { color: t.text, fontSize: 13, lineHeight: 20 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: t.spacing.xxl,
    paddingBottom: t.spacing.lg,
    paddingTop: t.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: t.border,
    backgroundColor: t.bg,
  },
  continueBtn: {
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: t.radius.lg,
    padding: t.spacing.md,
  },
  errorText: { color: '#fca5a5', fontSize: 13, textAlign: 'center' },
  pressed: { opacity: 0.92 },
})

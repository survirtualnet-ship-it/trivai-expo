import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Check, ChevronLeft } from 'lucide-react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { useBusinessSubscription } from '@/hooks/useBusinessSubscription'
import { updateBusinessSubscription } from '@/lib/business/businessPlan'
import {
  BUSINESS_PLAN_OPTIONS,
  planBadgeLabel,
  type PlanOption,
} from '@/lib/business/planOptions'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import { businessSubscriptionKeys } from '@/hooks/useBusinessSubscription'
import { ownedBusinessListKeys } from '@/hooks/useOwnedBusinessesList'
import { companyTheme as t } from '../theme'

type Props = {
  placeId: string
  businessName?: string
  mode?: 'onboarding' | 'manage'
  onComplete?: (
    placeId: string,
    tier: Exclude<BusinessSubscriptionTier, 'none'>,
  ) => void | Promise<void>
}

export function ChoosePlanScreen({
  placeId,
  businessName,
  mode = 'manage',
  onComplete,
}: Props) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const { tier: currentTier, isLoading: tierLoading } = useBusinessSubscription(placeId)
  const [selected, setSelected] = useState<Exclude<BusinessSubscriptionTier, 'none'>>('free')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOnboarding = mode === 'onboarding'
  const title = isOnboarding ? 'Elige tu plan' : 'Cambiar plan'

  useEffect(() => {
    if (currentTier && currentTier !== 'none') {
      setSelected(currentTier)
    }
  }, [currentTier])

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

      if (isOnboarding) {
        router.replace(`/empresa/${placeId}`)
        return
      }

      if (router.canGoBack()) {
        router.back()
        return
      }

      router.replace('/(tabs)/profile')
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

  const handleBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace(isOnboarding ? '/empresa/onboarding' : '/(tabs)/profile')
  }

  if (tierLoading && !isOnboarding) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <ChevronLeft size={24} color={t.text} />
          </Pressable>
          <Text style={styles.navTitle}>{title}</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator color={t.accent} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.nav}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>Suscripción Trivai</Text>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subtitle}>
          {isOnboarding
            ? businessName
              ? `${businessName} ya está reclamado. Elige un plan para activar herramientas (sin cobro por ahora).`
              : 'Tu negocio ya está reclamado. Elige un plan para activar herramientas (sin cobro por ahora).'
            : businessName
              ? `Administra el plan de ${businessName}. Puedes cambiarlo cuando quieras (sin cobro por ahora).`
              : 'Administra tu plan. Puedes cambiarlo cuando quieras (sin cobro por ahora).'}
        </Text>

        {currentTier && currentTier !== 'none' ? (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanLabel}>Plan actual</Text>
            <Text style={styles.currentPlanValue}>{planBadgeLabel(currentTier)}</Text>
          </View>
        ) : null}

        <View style={styles.cards}>
          {BUSINESS_PLAN_OPTIONS.map(option => (
            <PlanCard
              key={option.id}
              option={option}
              selected={selected === option.id}
              isCurrent={currentTier === option.id}
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
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && styles.pressed,
            saving && styles.continueBtnDisabled,
          ]}
          onPress={() => void handleContinue()}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueLabel}>
              {selected === currentTier && currentTier !== 'none'
                ? 'Mantener plan'
                : 'Confirmar plan'}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function PlanCard({
  option,
  selected,
  isCurrent,
  onSelect,
}: {
  option: PlanOption
  selected: boolean
  isCurrent: boolean
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
        <View style={styles.cardTitleWrap}>
          <Text style={styles.planName}>{option.name}</Text>
          <Text style={styles.planPrice}>{option.priceLabel}</Text>
        </View>
        <View style={styles.cardBadges}>
          {isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Actual</Text>
            </View>
          ) : null}
          {selected ? (
            <View style={styles.check}>
              <Check size={16} color="#fff" strokeWidth={3} />
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.planDesc}>{option.description}</Text>

      <View style={styles.features}>
        {option.features.map(feature => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.feature}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.selectBtn, selected && styles.selectBtnActive]}>
        <Text style={[styles.selectLabel, selected && styles.selectLabelActive]}>
          {selected ? 'Plan seleccionado' : 'Seleccionar plan'}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.spacing.sm,
    paddingVertical: t.spacing.sm,
    backgroundColor: t.surface,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    color: t.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: t.spacing.xs,
  },
  navSpacer: {
    width: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.xl,
    gap: t.spacing.md,
  },
  kicker: {
    color: t.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heading: {
    color: t.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: t.accentSoft,
    borderRadius: t.radius.lg,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 76, 241, 0.2)',
  },
  currentPlanLabel: {
    color: t.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  currentPlanValue: {
    color: t.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  cards: {
    gap: t.spacing.md,
    marginTop: t.spacing.xs,
  },
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
  },
  cardHighlight: {
    borderColor: 'rgba(108, 76, 241, 0.25)',
  },
  cardSelected: {
    borderColor: t.accent,
    backgroundColor: t.accentSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  planName: {
    color: t.text,
    fontSize: 18,
    fontWeight: '800',
  },
  planPrice: {
    color: t.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: t.surface,
    borderRadius: t.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: t.border,
  },
  currentBadgeText: {
    color: t.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  planDesc: {
    color: t.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  features: {
    gap: t.spacing.xs,
    marginTop: t.spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
  },
  featureCheck: {
    color: t.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  feature: {
    flex: 1,
    color: t.text,
    fontSize: 14,
    lineHeight: 20,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: t.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtn: {
    marginTop: t.spacing.sm,
    paddingVertical: 12,
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.accent,
    alignItems: 'center',
    backgroundColor: t.surface,
  },
  selectBtnActive: {
    backgroundColor: t.accent,
    borderColor: t.accent,
  },
  selectLabel: {
    color: t.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  selectLabelActive: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.sm,
    paddingBottom: t.spacing.md,
    borderTopWidth: 1,
    borderTopColor: t.border,
    backgroundColor: t.surface,
  },
  continueBtn: {
    backgroundColor: t.accent,
    borderRadius: t.radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: t.radius.lg,
    padding: t.spacing.md,
    borderWidth: 1,
    borderColor: '#F5C2C2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.92,
  },
})

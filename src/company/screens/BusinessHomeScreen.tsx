import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { Feather } from '@expo/vector-icons'
import { useBusinessSubscription } from '@/hooks/useBusinessSubscription'
import { useCompanyProfileStore } from '@/src/company/store/useCompanyProfileStore'
import { BusinessHomeHeader } from '@/src/company/components/home/BusinessHomeHeader'
import { SubscriptionRequiredGate } from '@/src/company/components/SubscriptionRequiredGate'
import { SimpleBarChart } from '@/src/company/components/SimpleBarChart'
import { UpgradePrompt } from '@/src/company/components/UpgradePrompt'
import {
  canAccessBasicDashboard,
  canAccessDashboard,
  canChangeBusinessLogo,
  canCreatePromotions,
  canEditProducts,
  canUseAnalytics,
} from '@/lib/business/planFeatures'
import { companyLogoFromRecord } from '@/lib/business/businessLogo'
import { uploadBusinessLogoFromUri } from '@/lib/business/uploadBusinessLogo'
import { fetchBusinessByPlaceIdEnriched } from '@/lib/business/businessPlan'
import {
  buildBusinessMetrics,
  MOCK_BUSINESS_ACTIVITY,
  MOCK_PROMOTIONS,
  type MetricPeriod,
} from '@/src/company/data/businessHomeData'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { companyTheme as ct } from '@/src/company/theme'

type Props = {
  placeId: string
}

const PERIODS: { id: MetricPeriod; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
]

export function BusinessHomeScreen({ placeId }: Props) {
  const { tier, isLoading: tierLoading } = useBusinessSubscription(placeId)
  const company = useCompanyProfileStore(s => s.company)
  const products = useCompanyProfileStore(s => s.products)
  const reviews = useCompanyProfileStore(s => s.reviews)
  const stats = useCompanyProfileStore(s => s.stats)
  const loadCompany = useCompanyProfileStore(s => s.loadCompany)
  const loadError = useCompanyProfileStore(s => s.loadError)
  const [period, setPeriod] = useState<MetricPeriod>('week')
  const [customLogo, setCustomLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await loadCompany(placeId)
      const row = await fetchBusinessByPlaceIdEnriched(placeId)
      if (!cancelled && row) {
        setCustomLogo(row.custom_logo_url ?? null)
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [loadCompany, placeId])

  const logoUrl = useMemo(() => {
    if (!company) return ''
    return companyLogoFromRecord({
      ...company,
      customLogoUrl: customLogo,
    })
  }, [company, customLogo])

  const metrics = useMemo(() => buildBusinessMetrics(period), [period])
  const featured = useMemo(() => products.filter(p => p.isFeatured).slice(0, 6), [products])
  const recentReviews = useMemo(() => reviews.slice(0, 3), [reviews])

  const handleChangeLogo = async () => {
    if (!canChangeBusinessLogo(tier)) return
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para subir el logo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]?.uri) return
    try {
      const url = await uploadBusinessLogoFromUri(placeId, result.assets[0].uri)
      setCustomLogo(url)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      Alert.alert('Error', 'No pudimos subir el logo. Intenta de nuevo.')
    }
  }

  if (loading || tierLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={T.purple} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!company) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{loadError ?? 'No pudimos cargar tu negocio.'}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true)
              void loadCompany(placeId).finally(() => setLoading(false))
            }}
          >
            <Text style={styles.retryLabel}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const googleReviewCount = company.reviewCount ?? 0

  if (tier === 'none') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <BusinessHomeHeader
          businessName={company.name}
          logoUrl={logoUrl}
          tier={tier}
          isVerified={company.isVerified}
        />
        <SubscriptionRequiredGate placeId={placeId} businessName={company.name} />
      </SafeAreaView>
    )
  }

  const showFullDashboard = canAccessDashboard(tier)
  const showBasicDashboard = canAccessBasicDashboard(tier)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <BusinessHomeHeader
          businessName={company.name}
          logoUrl={logoUrl}
          tier={tier}
          isVerified={company.isVerified}
          logoChangeBlocked={!canChangeBusinessLogo(tier)}
          onPressLogo={() => void handleChangeLogo()}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{company.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>★★★★☆</Text>
            <Text style={styles.ratingVal}>{company.rating.toFixed(1)}</Text>
            {googleReviewCount > 0 ? (
              <Text style={styles.reviewCount}>{googleReviewCount} reseñas Google</Text>
            ) : (
              <Text style={styles.reviewCount}>Reseñas Google</Text>
            )}
          </View>
          <Text style={styles.category}>{company.category}</Text>
          <View style={styles.statusRow}>
            <StatusDot label="Reclamado" color={T.green} />
            {company.isVerified ? <StatusDot label="Verificado" color={T.purple} /> : null}
            <StatusDot label={`Plan ${tier.toUpperCase()}`} color={T.orange} />
          </View>
        </View>

        {showBasicDashboard ? (
          <Section title="Dashboard">
            <View style={styles.periodRow}>
              {PERIODS.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    void Haptics.selectionAsync()
                    setPeriod(p.id)
                  }}
                  style={[styles.periodChip, period === p.id && styles.periodChipActive]}
                >
                  <Text style={[styles.periodLabel, period === p.id && styles.periodLabelActive]}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.metricsGrid}>
              {metrics.map(m => (
                <View key={m.key} style={styles.metricWrap}>
                  <View style={styles.metricIcon}>
                    <Feather name={m.icon as never} size={16} color={T.purple} />
                  </View>
                  <Text style={styles.metricValue}>{m.value.toLocaleString()}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text
                    style={[
                      styles.metricChange,
                      { color: m.changePercent >= 0 ? T.green : T.danger },
                    ]}
                  >
                    {m.changePercent >= 0 ? '+' : ''}
                    {m.changePercent}%
                  </Text>
                </View>
              ))}
            </View>
            {showFullDashboard && stats ? (
              <View style={styles.chartWrap}>
                <SimpleBarChart values={stats.weeklyViews} />
              </View>
            ) : null}
          </Section>
        ) : (
          <UpgradePrompt message="Elige un plan para ver métricas." placeId={placeId} />
        )}

        <Section title="Actividad del negocio">
          {MOCK_BUSINESS_ACTIVITY.map(item => (
            <View key={item.id} style={styles.activityRow}>
              <Text style={styles.activityTime}>{item.timeAgo}</Text>
              <Text style={styles.activityTitle}>{item.title}</Text>
            </View>
          ))}
        </Section>

        <Section title="Acciones rápidas">
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="edit-3"
              label="Editar negocio"
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
            <QuickAction
              icon="package"
              label="Agregar producto"
              locked={!canEditProducts(tier)}
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
            <QuickAction
              icon="tag"
              label="Crear promoción"
              locked={!canCreatePromotions(tier)}
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
            <QuickAction
              icon="image"
              label="Subir foto"
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
            <QuickAction
              icon="message-circle"
              label="Responder reseñas"
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
            <QuickAction
              icon="bar-chart-2"
              label="Ver Analytics"
              locked={!canUseAnalytics(tier)}
              onPress={() => router.push(`/empresa/${placeId}` as never)}
            />
          </View>
        </Section>

        {featured.length > 0 ? (
          <Section title="Productos destacados">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {featured.map(p => (
                <Pressable
                  key={p.id}
                  style={styles.productCard}
                  onPress={() => router.push(`/empresa/${placeId}` as never)}
                >
                  <Text style={styles.productName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.productPrice}>Bs {p.price}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Section>
        ) : null}

        {canCreatePromotions(tier) ? (
          <Section title="Promociones activas">
            {MOCK_PROMOTIONS.map(p => (
              <View key={p.id} style={styles.promoCard}>
                <Text style={styles.promoTitle}>{p.title}</Text>
                <Text style={styles.promoMeta}>
                  {p.status === 'active' ? 'Activa' : 'Programada'} · {p.endsAt} · {p.clicks} clicks
                </Text>
              </View>
            ))}
          </Section>
        ) : null}

        <Section title="Reseñas recientes">
          {recentReviews.length === 0 ? (
            <Text style={styles.empty}>Aún no hay reseñas recientes.</Text>
          ) : (
            recentReviews.map(r => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <Text style={styles.reviewUser}>{r.userName}</Text>
                  <Text style={styles.reviewRating}>★ {r.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewComment} numberOfLines={3}>
                  {r.comment}
                </Text>
                <Pressable
                  style={styles.replyBtn}
                  onPress={() => router.push(`/empresa/${placeId}` as never)}
                >
                  <Text style={styles.replyLabel}>Responder</Text>
                </Pressable>
              </View>
            ))
          )}
        </Section>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function StatusDot({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  )
}

function QuickAction({
  icon,
  label,
  locked,
  onPress,
}: {
  icon: string
  label: string
  locked?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, locked && styles.actionLocked, pressed && styles.pressed]}
    >
      <Feather name={icon as never} size={20} color={locked ? T.fg3 : T.purple} />
      <Text style={[styles.actionLabel, locked && styles.actionLabelLocked]}>{label}</Text>
      {locked ? <Text style={styles.lockHint}>Plan Pro</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: S.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xl },
  errorText: { color: T.fg2, fontSize: F.size.md, textAlign: 'center', marginBottom: S.md },
  retryBtn: {
    backgroundColor: T.purple,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
    borderRadius: R.full,
  },
  retryLabel: { color: '#fff', fontWeight: '700' },
  infoCard: {
    marginHorizontal: S.lg,
    marginBottom: S.lg,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.sm,
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  infoName: { fontSize: F.size.hero, fontWeight: '800', color: T.fg1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, flexWrap: 'wrap' },
  stars: { color: ct.star, fontSize: F.size.md },
  ratingVal: { fontWeight: '700', color: T.fg1, fontSize: F.size.lg },
  reviewCount: { color: T.fg3, fontSize: F.size.sm },
  category: { color: T.fg2, fontSize: F.size.md },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginTop: S.xs },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: T.muted,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: F.size.sm, fontWeight: '600', color: T.fg2 },
  section: { paddingHorizontal: S.lg, marginBottom: S.xl, gap: S.md },
  sectionTitle: { fontSize: F.size.xxl, fontWeight: '800', color: T.fg1 },
  periodRow: { flexDirection: 'row', gap: S.sm },
  periodChip: {
    paddingHorizontal: S.md,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: T.muted,
  },
  periodChipActive: { backgroundColor: T.purpleSoft },
  periodLabel: { fontSize: F.size.sm, fontWeight: '600', color: T.fg3 },
  periodLabelActive: { color: T.purple, fontWeight: '700' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  metricWrap: {
    width: '47%',
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    gap: 2,
    ...SHADOW.sm,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: R.md,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: { fontSize: F.size.xxl, fontWeight: '800', color: T.fg1 },
  metricLabel: { fontSize: F.size.sm, color: T.fg3, fontWeight: '600' },
  metricChange: { fontSize: F.size.sm, fontWeight: '700' },
  chartWrap: { marginTop: S.md },
  activityRow: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    gap: 4,
  },
  activityTime: { fontSize: F.size.sm, color: T.fg3 },
  activityTitle: { fontSize: F.size.md, fontWeight: '600', color: T.fg1 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
  },
  actionCard: {
    width: '47%',
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.lg,
    gap: S.sm,
    borderWidth: 1,
    borderColor: T.border,
    ...SHADOW.sm,
  },
  actionLocked: { opacity: 0.72 },
  actionLabel: { fontSize: F.size.md, fontWeight: '700', color: T.fg1 },
  actionLabelLocked: { color: T.fg3 },
  lockHint: { fontSize: F.size.xs, color: T.purple, fontWeight: '600' },
  carousel: { gap: S.sm, paddingRight: S.lg },
  productCard: {
    width: 140,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
  },
  productName: { fontWeight: '700', color: T.fg1, fontSize: F.size.md },
  productPrice: { color: T.purple, fontWeight: '700', marginTop: 4 },
  promoCard: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    gap: 4,
  },
  promoTitle: { fontWeight: '700', color: T.fg1 },
  promoMeta: { fontSize: F.size.sm, color: T.fg3 },
  reviewCard: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: T.border,
    gap: S.sm,
  },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewUser: { fontWeight: '700', color: T.fg1 },
  reviewRating: { color: ct.star, fontWeight: '700' },
  reviewComment: { color: T.fg2, lineHeight: 20, fontSize: F.size.md },
  replyBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: T.purpleSoft,
  },
  replyLabel: { color: T.purple, fontWeight: '700', fontSize: F.size.sm },
  empty: { color: T.fg3, fontSize: F.size.md },
  bottomPad: { height: S.xxxl },
  pressed: { opacity: 0.9 },
})

import { useEffect, type ReactNode } from 'react'
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
import { Feather } from '@expo/vector-icons'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { usePermissions } from '@/hooks/usePermissions'
import { useBusinessSubscription } from '@/hooks/useBusinessSubscription'
import { useCompanyProfileStore } from '@/src/company/store/useCompanyProfileStore'
import { BusinessHomeHeader } from '@/src/company/components/home/BusinessHomeHeader'
import { SubscriptionRequiredGate } from '@/src/company/components/SubscriptionRequiredGate'
import { companyLogoFromRecord } from '@/lib/business/businessLogo'
import { planBadgeLabel, planManageActionLabel } from '@/lib/business/planOptions'
import { MyBusinessEmptyScreen } from '@/src/company/screens/MyBusinessEmptyScreen'
import { T, F, S, R, SHADOW } from '@/lib/tokens'

export function BusinessProfileScreen() {
  const { activeBusinessId } = usePermissions()
  const placeId = activeBusinessId ?? ''
  const { tier, isLoading: tierLoading } = useBusinessSubscription(placeId || null)
  const company = useCompanyProfileStore(s => s.company)
  const enrichment = useCompanyProfileStore(s => s.enrichment)
  const products = useCompanyProfileStore(s => s.products)
  const galleryItems = useCompanyProfileStore(s => s.galleryItems)
  const loadCompany = useCompanyProfileStore(s => s.loadCompany)
  const loadingRemote = useCompanyProfileStore(s => s.loadingRemote)

  useEffect(() => {
    if (placeId) void loadCompany(placeId)
  }, [loadCompany, placeId])

  if (!placeId) {
    return <MyBusinessEmptyScreen />
  }

  if (loadingRemote || tierLoading || !company) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator color={T.purple} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  const logoUrl = companyLogoFromRecord(company)

  if (tier === 'none') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <BusinessHomeHeader businessName={company.name} logoUrl={logoUrl} tier={tier} />
        <SubscriptionRequiredGate placeId={placeId} businessName={company.name} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <Text style={styles.navTitle}>Perfil Empresa</Text>
          <LogoutButton variant="nav" />
        </View>

        <BusinessHomeHeader
          businessName={company.name}
          logoUrl={logoUrl}
          tier={tier}
          isVerified={company.isVerified}
        />

        <View style={styles.claimedBanner}>
          <Text style={styles.claimedTitle}>Empresa reclamada</Text>
          <Text style={styles.claimedPlan}>Plan {planBadgeLabel(tier)}</Text>
        </View>

        <ProfileSection title="Información">
          <InfoRow label="Nombre" value={company.name} />
          <InfoRow label="Categoría" value={company.category} locked />
          <InfoRow label="Teléfono" value={company.phone || '—'} />
          <InfoRow label="WhatsApp" value={company.whatsapp || '—'} />
          <InfoRow label="Web" value={company.website || '—'} />
          <InfoRow label="Email" value={company.email} locked />
          <InfoRow label="Dirección" value={company.location.address} locked />
          <NavRow
            label="Editar información y horarios"
            onPress={() => router.push(`/empresa/${placeId}` as never)}
          />
        </ProfileSection>

        <ProfileSection title="Galería">
          <NavRow label="Fotos y videos" onPress={() => router.push(`/empresa/${placeId}` as never)} />
        </ProfileSection>

        <ProfileSection title="Productos">
          <NavRow label="Administrar productos" onPress={() => router.push(`/empresa/${placeId}` as never)} />
        </ProfileSection>

        <ProfileSection title="Promociones">
          <NavRow label="Administrar promociones" onPress={() => router.push(`/empresa/${placeId}` as never)} />
        </ProfileSection>

        <ProfileSection title="Redes sociales">
          <InfoRow label="Instagram" value={enrichment?.social.instagram || '—'} />
          <InfoRow label="Facebook" value={enrichment?.social.facebook || '—'} />
          <InfoRow label="TikTok" value={enrichment?.social.tiktok || '—'} />
          <InfoRow label="YouTube" value={enrichment?.social.youtube || '—'} />
          <InfoRow label="LinkedIn" value={enrichment?.social.linkedin || '—'} />
          <InfoRow label="X" value={enrichment?.social.x || '—'} />
          <NavRow
            label="Editar redes"
            onPress={() => router.push(`/empresa/${placeId}` as never)}
          />
        </ProfileSection>

        <ProfileSection title="Configuración">
          <NavRow label="Información general" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <NavRow label="Contacto" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <NavRow label="Horarios" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <NavRow label="Galería" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <NavRow label="Productos" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <NavRow label="Menú" onPress={() => router.push(`/empresa/${placeId}` as never)} />
          <InfoRow label="Productos publicados" value={String(products.length)} />
          <InfoRow label="Fotos en galería" value={String(galleryItems.length)} />
        </ProfileSection>

        <ProfileSection title="Suscripción">
          <InfoRow label="Plan actual" value={planBadgeLabel(tier)} />
          <NavRow
            label={planManageActionLabel(tier)}
            onPress={() =>
              router.push({
                pathname: '/empresa/suscripcion',
                params: { placeId, name: company.name },
              } as never)
            }
          />
          <InfoRow label="Historial" value="Próximamente" />
          <InfoRow label="Facturación" value="Próximamente" />
        </ProfileSection>

        <ProfileSection title="Seguridad y cuenta">
          <InfoRow label="Idioma" value="Español" />
          <InfoRow label="Notificaciones" value="Activadas" />
          <InfoRow label="Privacidad" value="Ver políticas" />
          <NavRow label="Eliminar negocio" danger onPress={() => {}} />
        </ProfileSection>

        <View style={styles.logoutWrap}>
          <LogoutButton variant="full" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function InfoRow({
  label,
  value,
  locked,
}: {
  label: string
  value: string
  locked?: boolean
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueWrap}>
        <Text style={[styles.rowValue, locked && styles.rowLocked]} numberOfLines={2}>
          {value}
        </Text>
        {locked ? <Feather name="lock" size={12} color={T.fg3} /> : null}
      </View>
    </View>
  )
}

function NavRow({
  label,
  onPress,
  danger,
}: {
  label: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}>
      <Text style={[styles.navRowLabel, danger && styles.danger]}>{label}</Text>
      <Feather name="chevron-right" size={18} color={danger ? T.danger : T.fg3} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: S.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
  },
  navTitle: { fontSize: F.size.xxl, fontWeight: '800', color: T.fg1 },
  claimedBanner: {
    marginHorizontal: S.lg,
    marginBottom: S.lg,
    backgroundColor: T.purpleSoft,
    borderRadius: R.lg,
    padding: S.lg,
    gap: 4,
  },
  claimedTitle: { fontSize: F.size.sm, fontWeight: '600', color: T.fg2 },
  claimedPlan: { fontSize: F.size.xl, fontWeight: '800', color: T.purple },
  section: { marginBottom: S.xl, paddingHorizontal: S.lg, gap: S.sm },
  sectionTitle: { fontSize: F.size.lg, fontWeight: '800', color: T.fg1 },
  sectionBody: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    gap: S.md,
  },
  rowLabel: { fontSize: F.size.md, color: T.fg2, flex: 1 },
  rowValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1.2, justifyContent: 'flex-end' },
  rowValue: { fontSize: F.size.md, fontWeight: '600', color: T.fg1, textAlign: 'right' },
  rowLocked: { color: T.fg3 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  navRowLabel: { fontSize: F.size.md, fontWeight: '600', color: T.purple },
  danger: { color: T.danger },
  logoutWrap: { paddingHorizontal: S.lg, marginTop: S.md },
  pressed: { opacity: 0.9 },
})

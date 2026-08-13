import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { CompanyHeader } from './components/CompanyHeader'
import { ProfileTabs } from './components/ProfileTabs'
import { BusinessSubscriptionBar } from './components/BusinessSubscriptionBar'
import { SubscriptionRequiredGate } from './components/SubscriptionRequiredGate'
import { UpgradePrompt } from './components/UpgradePrompt'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { useCompanyProfileStore } from './store/useCompanyProfileStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { useBusinessSubscription } from '@/hooks/useBusinessSubscription'
import { useBusinessDashboard } from '@/hooks/useBusinessDashboard'
import {
  canAccessDashboard,
  canEditBasicInfo,
  canEditProducts,
  canUseBusinessFeature,
  tabAllowedForTier,
  upgradeMessageForFeature,
} from '@/lib/business/planFeatures'
import type { CompanyTab } from './types'
import { HomeTab } from './tabs/HomeTab'
import { HoursTab } from './tabs/HoursTab'
import { SocialTab } from './tabs/SocialTab'
import { ProductsTab } from './tabs/ProductsTab'
import { GalleryTab } from './tabs/GalleryTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import { DashboardTab } from './tabs/DashboardTab'
import { companyTheme as t } from './theme'

type Props = {
  companyId: string
  initialTab?: CompanyTab
}

export function CompanyProfileScreen({ companyId, initialTab }: Props) {
  const company = useCompanyProfileStore(s => s.company)
  const products = useCompanyProfileStore(s => s.products)
  const reviews = useCompanyProfileStore(s => s.reviews)
  const gallery = useCompanyProfileStore(s => s.gallery)
  const enrichment = useCompanyProfileStore(s => s.enrichment)
  const addGalleryImage = useCompanyProfileStore(s => s.addGalleryImage)
  const editMode = useCompanyProfileStore(s => s.editMode)
  const draftCompany = useCompanyProfileStore(s => s.draftCompany)
  const activeTab = useCompanyProfileStore(s => s.activeTab)
  const loadingRemote = useCompanyProfileStore(s => s.loadingRemote)
  const loadError = useCompanyProfileStore(s => s.loadError)
  const userCompanyId = useProfileStore(s => s.user.companyId)
  const authCompanyId = useAuthStore(s => s.user?.companyId)
  const isOwner =
    userCompanyId === companyId ||
    authCompanyId === companyId

  const { tier, isLoading: subscriptionLoading } = useBusinessSubscription(
    isOwner ? companyId : null,
  )
  const { data: dashboardData } = useBusinessDashboard(
    isOwner ? companyId : null,
    'week',
    tier,
    company?.rating ?? 0,
  )
  const dashboardStats = dashboardData?.stats ?? null
  const needsPlan = isOwner && tier === 'none'

  const loadCompany = useCompanyProfileStore(s => s.loadCompany)
  const setActiveTab = useCompanyProfileStore(s => s.setActiveTab)
  const setEditMode = useCompanyProfileStore(s => s.setEditMode)
  const updateDraft = useCompanyProfileStore(s => s.updateDraft)
  const saveProfile = useCompanyProfileStore(s => s.saveProfile)
  const cancelEdit = useCompanyProfileStore(s => s.cancelEdit)
  const addProduct = useCompanyProfileStore(s => s.addProduct)
  const updateProduct = useCompanyProfileStore(s => s.updateProduct)
  const deleteProduct = useCompanyProfileStore(s => s.deleteProduct)
  const replyToReview = useCompanyProfileStore(s => s.replyToReview)
  const saveHours = useCompanyProfileStore(s => s.saveHours)
  const saveSocial = useCompanyProfileStore(s => s.saveSocial)

  const [storeHydrated, setStoreHydrated] = useState(
    useCompanyProfileStore.persist.hasHydrated(),
  )

  useEffect(() => {
    const unsub = useCompanyProfileStore.persist.onFinishHydration(() => {
      setStoreHydrated(true)
    })
    if (useCompanyProfileStore.persist.hasHydrated()) {
      setStoreHydrated(true)
    }
    return unsub
  }, [])

  useEffect(() => {
    if (!isOwner) return
    if (needsPlan) return
    if (!tabAllowedForTier(activeTab, tier)) {
      const fallback: CompanyTab[] = [
        'home',
        'hours',
        'social',
        'reviews',
        'products',
        'gallery',
        'dashboard',
      ]
      const next = fallback.find(tab => tabAllowedForTier(tab, tier)) ?? 'home'
      setActiveTab(next)
    }
  }, [activeTab, isOwner, needsPlan, setActiveTab, tier])

  useEffect(() => {
    if (!initialTab || needsPlan || subscriptionLoading) return
    if (tabAllowedForTier(initialTab, tier)) {
      setActiveTab(initialTab)
    }
  }, [initialTab, needsPlan, setActiveTab, subscriptionLoading, tier])

  useEffect(() => {
    if (activeTab === 'dashboard' && !isOwner) {
      setActiveTab('home')
    }
  }, [activeTab, isOwner, setActiveTab])

  useEffect(() => {
    if (!storeHydrated) return
    void loadCompany(companyId)
  }, [companyId, userCompanyId, authCompanyId, loadCompany, storeHydrated])

  const featuredProducts = useMemo(
    () => products.filter(p => p.isFeatured).slice(0, 3),
    [products],
  )

  const handleToggleEdit = useCallback(() => {
    if (editMode) cancelEdit()
    else setEditMode(true)
  }, [cancelEdit, editMode, setEditMode])

  const handleSave = useCallback(() => {
    void saveProfile()
  }, [saveProfile])

  const canEditBasic = isOwner && canEditBasicInfo(tier)
  const canEditHours = isOwner && canUseBusinessFeature(tier, 'hours')
  const canEditSocial = isOwner && canUseBusinessFeature(tier, 'contact')
  const canReplyReviews = isOwner && canUseBusinessFeature(tier, 'reply_reviews')

  if (!storeHydrated || loadingRemote || subscriptionLoading || (!company && !loadError)) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={t.text} />
          </Pressable>
          <Text style={styles.navTitle}>Panel avanzado</Text>
          <LogoutButton variant="nav" />
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={t.accent} size="large" />
          <Text style={styles.emptyText}>Cargando tu negocio...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!company) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={t.text} />
          </Pressable>
          <Text style={styles.navTitle}>Panel avanzado</Text>
          <LogoutButton variant="nav" />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {loadError ?? 'Empresa no encontrada'}
          </Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => void loadCompany(companyId)}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/empresa/onboarding')}>
            <Text style={styles.linkText}>Registrar negocio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back()
            else router.replace('/(tabs)/')
          }}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {company.name}
        </Text>
        <LogoutButton variant="nav" />
      </View>

      <CompanyHeader
        company={company}
        editMode={editMode && canEditBasic}
        isOwner={isOwner}
        canEdit={canEditBasic}
        onToggleEdit={handleToggleEdit}
        onSave={handleSave}
      />

      {needsPlan ? (
        <SubscriptionRequiredGate placeId={companyId} businessName={company.name} />
      ) : (
        <>
          {isOwner ? (
            <BusinessSubscriptionBar
              placeId={companyId}
              businessName={company.name}
              tier={tier}
            />
          ) : null}

          <ProfileTabs
            active={activeTab}
            tier={tier}
            isOwner={isOwner}
            onSelect={setActiveTab}
          />

          <View style={styles.tabBody}>
            {activeTab === 'home' ? (
              <HomeTab
                company={company}
                draft={draftCompany}
                editMode={editMode && canEditBasic}
                featuredProducts={featuredProducts}
                onUpdateDraft={updateDraft}
              />
            ) : null}

            {activeTab === 'hours' ? (
              canEditHours || !isOwner ? (
                <HoursTab
                  hours={enrichment?.hours ?? null}
                  canEdit={canEditHours}
                  onSave={saveHours}
                />
              ) : (
                <UpgradePrompt
                  message={upgradeMessageForFeature(tier, 'hours')}
                  placeId={companyId}
                />
              )
            ) : null}

            {activeTab === 'social' ? (
              canEditSocial || !isOwner ? (
                <SocialTab
                  social={enrichment?.social ?? {}}
                  canEdit={canEditSocial}
                  onSave={saveSocial}
                />
              ) : (
                <UpgradePrompt
                  message={upgradeMessageForFeature(tier, 'contact')}
                  placeId={companyId}
                />
              )
            ) : null}

            {activeTab === 'products' ? (
              canEditProducts(tier) ? (
                <ProductsTab
                  products={products}
                  editMode={editMode && isOwner}
                  onAdd={addProduct}
                  onUpdate={updateProduct}
                  onDelete={deleteProduct}
                />
              ) : (
                <UpgradePrompt
                  message={upgradeMessageForFeature(tier, 'products')}
                  placeId={companyId}
                />
              )
            ) : null}

            {activeTab === 'gallery' ? (
              canUseBusinessFeature(tier, 'gallery') ? (
                <GalleryTab
                  images={gallery}
                  tier={tier}
                  canEdit={isOwner}
                  onUpload={uri => addGalleryImage(uri, tier)}
                />
              ) : (
                <UpgradePrompt
                  message={upgradeMessageForFeature(tier, 'gallery')}
                  placeId={companyId}
                />
              )
            ) : null}

            {activeTab === 'reviews' ? (
              <ReviewsTab
                reviews={reviews}
                canReply={canReplyReviews}
                onReply={replyToReview}
              />
            ) : null}

            {activeTab === 'dashboard' && isOwner ? (
              canAccessDashboard(tier) && dashboardStats ? (
                <DashboardTab stats={dashboardStats} metrics={dashboardData?.metrics} />
              ) : (
                <UpgradePrompt
                  message={upgradeMessageForFeature(tier, 'dashboard')}
                  placeId={companyId}
                />
              )
            ) : null}
          </View>
        </>
      )}
    </SafeAreaView>
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
  tabBody: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    paddingHorizontal: t.spacing.xl,
  },
  emptyText: {
    color: t.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: t.spacing.sm,
    backgroundColor: t.accent,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    borderRadius: 999,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  linkText: {
    color: t.accent,
    fontSize: 14,
    fontWeight: '600',
  },
})

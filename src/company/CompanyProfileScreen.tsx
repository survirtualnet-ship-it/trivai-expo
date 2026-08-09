import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { CompanyHeader } from './components/CompanyHeader'
import { ProfileTabs } from './components/ProfileTabs'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { useCompanyProfileStore } from './store/useCompanyProfileStore'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { HomeTab } from './tabs/HomeTab'
import { ProductsTab } from './tabs/ProductsTab'
import { GalleryTab } from './tabs/GalleryTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import { DashboardTab } from './tabs/DashboardTab'
import { companyTheme as t } from './theme'

type Props = {
  companyId: string
}

export function CompanyProfileScreen({ companyId }: Props) {
  const company = useCompanyProfileStore(s => s.company)
  const products = useCompanyProfileStore(s => s.products)
  const reviews = useCompanyProfileStore(s => s.reviews)
  const stats = useCompanyProfileStore(s => s.stats)
  const gallery = useCompanyProfileStore(s => s.gallery)
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

  if (!storeHydrated || loadingRemote || (!company && !loadError)) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={t.text} />
          </Pressable>
          <Text style={styles.navTitle}>Perfil de empresa</Text>
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
          <Text style={styles.navTitle}>Perfil de empresa</Text>
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={t.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {company.name}
        </Text>
        <LogoutButton variant="nav" />
      </View>

      <CompanyHeader
        company={company}
        editMode={editMode}
        isOwner={isOwner}
        onToggleEdit={handleToggleEdit}
        onSave={handleSave}
      />

      <ProfileTabs
        active={activeTab}
        showDashboard={isOwner}
        onSelect={setActiveTab}
      />

      <View style={styles.tabBody}>
        {activeTab === 'home' ? (
          <HomeTab
            company={company}
            draft={draftCompany}
            editMode={editMode}
            featuredProducts={featuredProducts}
            onUpdateDraft={updateDraft}
          />
        ) : null}

        {activeTab === 'products' ? (
          <ProductsTab
            products={products}
            editMode={editMode && isOwner}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        ) : null}

        {activeTab === 'gallery' ? <GalleryTab images={gallery} /> : null}

        {activeTab === 'reviews' ? (
          <ReviewsTab
            reviews={reviews}
            canReply={isOwner}
            onReply={replyToReview}
          />
        ) : null}

        {activeTab === 'dashboard' && stats && isOwner ? (
          <DashboardTab stats={stats} />
        ) : null}
      </View>
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

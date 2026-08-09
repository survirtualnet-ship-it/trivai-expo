import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import {
  buildInitialCatalog,
  buildInitialCompanies,
  getCompanyById as selectCompanyById,
  getCompanyCatalog as selectCatalog,
  type CompanyCatalog,
} from './companySelectors'
import {
  fetchCompanyByPlaceId,
  updatePlaceFromCompany,
} from '../utils/fromPlace'
import type {
  Company,
  CompanyTab,
  DashboardStats,
  Product,
  Review,
} from '../types'

const EMPTY_STATS: DashboardStats = {
  views: 0,
  clicks: 0,
  saves: 0,
  rating: 0,
  weeklyViews: [0, 0, 0, 0, 0, 0, 0],
}

type CompanyProfileStore = {
  companies: Record<string, Company>
  catalog: Record<string, CompanyCatalog>
  activeCompanyId: string | null
  company: Company | null
  products: Product[]
  reviews: Review[]
  stats: DashboardStats | null
  gallery: string[]
  editMode: boolean
  isCompanyOwner: boolean
  activeTab: CompanyTab
  draftCompany: Partial<Company> | null
  loadingRemote: boolean
  loadError: string | null
  registerCompany: (company: Company) => string
  loadCompany: (companyId: string) => Promise<void>
  setActiveTab: (tab: CompanyTab) => void
  setEditMode: (value: boolean) => void
  updateDraft: (patch: Partial<Company>) => void
  saveProfile: () => Promise<void>
  cancelEdit: () => void
  addProduct: (product: Omit<Product, 'id' | 'companyId'>) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  replyToReview: (reviewId: string, reply: string) => void
}

function newProductId() {
  return `prod-${Date.now()}`
}

function mergeCompanies(
  persisted: Record<string, Company>,
): Record<string, Company> {
  return { ...buildInitialCompanies(), ...persisted }
}

function mergeCatalog(
  persisted: Record<string, CompanyCatalog>,
): Record<string, CompanyCatalog> {
  return { ...buildInitialCatalog(), ...persisted }
}

function resolveIsOwner(companyId: string): boolean {
  const profileCompanyId = useProfileStore.getState().user.companyId
  const authUser = useAuthStore.getState().user
  return (
    profileCompanyId === companyId ||
    authUser?.companyId === companyId
  )
}

function syncActiveView(
  companyId: string,
  companies: Record<string, Company>,
  catalog: Record<string, CompanyCatalog>,
  isOwner: boolean,
) {
  const company = selectCompanyById(companies, companyId)
  const entry = selectCatalog(catalog, companyId)

  if (!company || !entry) {
    return {
      activeCompanyId: companyId,
      company: null,
      products: [],
      reviews: [],
      stats: null,
      gallery: [],
      isCompanyOwner: isOwner,
      editMode: false,
      draftCompany: null,
    }
  }

  return {
    activeCompanyId: companyId,
    company,
    products: entry.products,
    reviews: entry.reviews,
    stats: entry.stats,
    gallery: entry.gallery,
    isCompanyOwner: isOwner,
    editMode: false,
    draftCompany: null,
  }
}

function emptyCatalogFor(company: Company): CompanyCatalog {
  return {
    products: [],
    reviews: [],
    stats: { ...EMPTY_STATS, rating: company.rating },
    gallery: [company.coverImage, company.profileImage].filter(Boolean),
  }
}

function patchCatalog(
  catalog: Record<string, CompanyCatalog>,
  companyId: string,
  patch: Partial<CompanyCatalog>,
): Record<string, CompanyCatalog> {
  const prev = catalog[companyId]
  if (!prev) return catalog
  return {
    ...catalog,
    [companyId]: { ...prev, ...patch },
  }
}

export const useCompanyProfileStore = create<CompanyProfileStore>()(
  persist(
    (set, get) => ({
      companies: buildInitialCompanies(),
      catalog: buildInitialCatalog(),
      activeCompanyId: null,
      company: null,
      products: [],
      reviews: [],
      stats: null,
      gallery: [],
      editMode: false,
      isCompanyOwner: false,
      activeTab: 'home',
      draftCompany: null,
      loadingRemote: false,
      loadError: null,

      registerCompany: company => {
        const normalized: Company = { ...company, isDemoCompany: false }
        const bundle = emptyCatalogFor(normalized)
        set(state => ({
          companies: { ...state.companies, [normalized.id]: normalized },
          catalog: { ...state.catalog, [normalized.id]: bundle },
        }))
        return normalized.id
      },

      loadCompany: async companyId => {
        if (!companyId) {
          set({
            company: null,
            loadError: 'Empresa no encontrada',
            loadingRemote: false,
            activeCompanyId: null,
          })
          return
        }

        const isOwner = resolveIsOwner(companyId)
        const { companies, catalog } = get()
        const local = selectCompanyById(companies, companyId)

        // Heal orphan local company without catalog (avoids infinite spinner)
        if (local) {
          const entry = selectCatalog(catalog, companyId) ?? emptyCatalogFor(local)
          const nextCatalog = { ...catalog, [companyId]: entry }
          set({
            catalog: nextCatalog,
            ...syncActiveView(companyId, companies, nextCatalog, isOwner),
            loadingRemote: false,
            loadError: null,
          })

          // Refresh claimed places from Supabase without blanking the UI
          if (!companyId.startsWith('co-')) {
            const email =
              useAuthStore.getState().user?.email ??
              useProfileStore.getState().user.email
            const remote = await fetchCompanyByPlaceId(companyId, email)
            if (remote) {
              const nextCompanies = { ...get().companies, [remote.id]: remote }
              const remoteCatalog =
                get().catalog[remote.id] ?? emptyCatalogFor(remote)
              const mergedCatalog = {
                ...get().catalog,
                [remote.id]: remoteCatalog,
              }
              set({
                companies: nextCompanies,
                catalog: mergedCatalog,
                ...syncActiveView(
                  companyId,
                  nextCompanies,
                  mergedCatalog,
                  resolveIsOwner(companyId),
                ),
                loadingRemote: false,
                loadError: null,
              })
            }
          }
          return
        }

        set({
          loadingRemote: true,
          loadError: null,
          activeCompanyId: companyId,
          company: null,
          isCompanyOwner: isOwner,
        })

        const email =
          useAuthStore.getState().user?.email ??
          useProfileStore.getState().user.email
        const remote = await fetchCompanyByPlaceId(companyId, email)

        if (!remote) {
          set({
            loadingRemote: false,
            loadError: 'Empresa no encontrada',
            company: null,
            products: [],
            reviews: [],
            stats: null,
            gallery: [],
            isCompanyOwner: isOwner,
          })
          return
        }

        const bundle = emptyCatalogFor(remote)
        const nextCompanies = { ...get().companies, [remote.id]: remote }
        const nextCatalog = { ...get().catalog, [remote.id]: bundle }

        set({
          companies: nextCompanies,
          catalog: nextCatalog,
          loadingRemote: false,
          loadError: null,
          ...syncActiveView(companyId, nextCompanies, nextCatalog, isOwner),
        })
      },

      setActiveTab: activeTab => set({ activeTab }),

      setEditMode: value => {
        const { company, isCompanyOwner } = get()
        if (!isCompanyOwner) return
        if (value && company) {
          set({ editMode: true, draftCompany: { ...company } })
          return
        }
        set({ editMode: false, draftCompany: null })
      },

      updateDraft: patch => {
        if (!get().isCompanyOwner) return
        const draft = get().draftCompany
        if (!draft) return
        set({ draftCompany: { ...draft, ...patch } })
      },

      saveProfile: async () => {
        if (!get().isCompanyOwner) return
        const { draftCompany, company, companies } = get()
        if (!draftCompany || !company) return

        const { email: _email, location, ...editable } = draftCompany
        const updated: Company = {
          ...company,
          ...editable,
          email: company.email,
          location: {
            ...company.location,
            ...(location ?? {}),
            address: location?.address ?? company.location.address,
          },
        }

        set({
          companies: { ...companies, [company.id]: updated },
          company: updated,
          editMode: false,
          draftCompany: null,
        })

        if (!updated.id.startsWith('co-')) {
          await updatePlaceFromCompany(updated)
        }
      },

      cancelEdit: () => set({ editMode: false, draftCompany: null }),

      addProduct: product => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company) return
        const item: Product = {
          ...product,
          id: newProductId(),
          companyId: company.id,
        }
        const next = [item, ...products]
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      updateProduct: (id, patch) => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company) return
        const next = products.map(p => (p.id === id ? { ...p, ...patch } : p))
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      deleteProduct: id => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company) return
        const next = products.filter(p => p.id !== id)
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      replyToReview: (reviewId, reply) => {
        if (!get().isCompanyOwner) return
        const { company, reviews, catalog } = get()
        if (!company) return
        const next = reviews.map(r =>
          r.id === reviewId ? { ...r, companyReply: reply.trim() } : r,
        )
        set({
          reviews: next,
          catalog: patchCatalog(catalog, company.id, { reviews: next }),
        })
      },
    }),
    {
      name: 'trivai-company-registry',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        companies: state.companies,
        catalog: state.catalog,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<CompanyProfileStore> | undefined
        const companies = mergeCompanies(p?.companies ?? {})
        const catalog = mergeCatalog(p?.catalog ?? {})
        return {
          ...current,
          companies,
          catalog,
        }
      },
    },
  ),
)

export function getCompanyById(companyId: string): Company | undefined {
  return selectCompanyById(useCompanyProfileStore.getState().companies, companyId)
}

export function getCompanyCatalogEntry(
  companyId: string,
): CompanyCatalog | undefined {
  return selectCatalog(useCompanyProfileStore.getState().catalog, companyId)
}

export const DEMO_COMPANY_ID = 'co-001'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import {
  buildInitialCatalog,
  buildInitialCompanies,
  getCompanyById as selectCompanyById,
  getCompanyCatalog as selectCatalog,
  type CompanyCatalog,
} from './companySelectors'
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
  /** Normalized company entities — single source of truth */
  companies: Record<string, Company>
  /** Products, reviews, stats, gallery keyed by company id */
  catalog: Record<string, CompanyCatalog>
  /** Currently viewed company id */
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
  registerCompany: (company: Company) => string
  loadCompany: (companyId: string) => void
  setActiveTab: (tab: CompanyTab) => void
  setEditMode: (value: boolean) => void
  updateDraft: (patch: Partial<Company>) => void
  saveProfile: () => void
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

      registerCompany: company => {
        const normalized: Company = { ...company, isDemoCompany: false }
        const bundle: CompanyCatalog = {
          products: [],
          reviews: [],
          stats: { ...EMPTY_STATS, rating: normalized.rating },
          gallery: [normalized.coverImage, normalized.profileImage],
        }
        set(state => ({
          companies: { ...state.companies, [normalized.id]: normalized },
          catalog: { ...state.catalog, [normalized.id]: bundle },
        }))
        return normalized.id
      },

      loadCompany: companyId => {
        const userCompanyId = useProfileStore.getState().user.companyId
        const isOwner = userCompanyId === companyId
        const { companies, catalog } = get()
        set(syncActiveView(companyId, companies, catalog, isOwner))
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

      saveProfile: () => {
        if (!get().isCompanyOwner) return
        const { draftCompany, company, companies, catalog } = get()
        if (!draftCompany || !company) return

        const { email, location, ...editable } = draftCompany
        const updated: Company = {
          ...company,
          ...editable,
          email: company.email,
          location: company.location,
        }

        set({
          companies: { ...companies, [company.id]: updated },
          company: updated,
          editMode: false,
          draftCompany: null,
        })
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

/** Selector — company entity by id */
export function getCompanyById(companyId: string): Company | undefined {
  return selectCompanyById(useCompanyProfileStore.getState().companies, companyId)
}

/** Selector — full catalog entry by company id */
export function getCompanyCatalogEntry(
  companyId: string,
): CompanyCatalog | undefined {
  return selectCatalog(useCompanyProfileStore.getState().catalog, companyId)
}

export const DEMO_COMPANY_ID = 'co-001'

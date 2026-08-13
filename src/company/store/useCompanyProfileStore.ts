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
import { fetchCompanyByPlaceId, updatePlaceFromCompany } from '../utils/fromPlace'
import {
  fetchBusinessProducts,
  createBusinessProduct,
  updateBusinessProduct,
  deleteBusinessProduct,
} from '@/lib/business/products'
import {
  fetchBusinessGalleryItems,
  uploadBusinessGalleryImage,
  deleteBusinessGalleryItem,
} from '@/lib/business/gallery'
import { fetchBusinessEnrichment, saveBusinessContact, saveBusinessHours, saveBusinessSocial } from '@/lib/business/profile'
import { countMenuItems } from '@/lib/business/menu'
import { fetchPlaceReviewsWithReplies, createReviewResponse } from '@/lib/reviews'
import { placeReviewsToCompanyReviews } from '@/lib/business/mapReviews'
import { trackBusinessEvent } from '@/lib/analytics/analytics'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import type { Company, CompanyTab, Product, Review } from '../types'
import type { BusinessEnrichment, BusinessHoursSchedule, GalleryItem, SocialLinks } from '@/lib/business/profileTypes'

type RemoteBundle = CompanyCatalog & {
  enrichment: BusinessEnrichment | null
  galleryItems: GalleryItem[]
  menuItemCount: number
}

type CompanyProfileStore = {
  companies: Record<string, Company>
  catalog: Record<string, CompanyCatalog>
  activeCompanyId: string | null
  company: Company | null
  products: Product[]
  reviews: Review[]
  gallery: string[]
  galleryItems: GalleryItem[]
  enrichment: BusinessEnrichment | null
  menuItemCount: number
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
  addProduct: (product: Omit<Product, 'id' | 'companyId'>) => Promise<void>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addGalleryImage: (uri: string, tier: BusinessSubscriptionTier) => Promise<void>
  removeGalleryImage: (itemId: string) => Promise<void>
  replyToReview: (reviewId: string, reply: string) => Promise<void>
  saveHours: (hours: BusinessHoursSchedule) => Promise<{ ok: boolean; error?: string }>
  saveSocial: (social: SocialLinks) => Promise<{ ok: boolean; error?: string }>
}

function mergeCompanies(persisted: Record<string, Company>): Record<string, Company> {
  return { ...buildInitialCompanies(), ...persisted }
}

function mergeCatalog(persisted: Record<string, CompanyCatalog>): Record<string, CompanyCatalog> {
  return { ...buildInitialCatalog(), ...persisted }
}

function resolveIsOwner(companyId: string): boolean {
  const profileCompanyId = useProfileStore.getState().user.companyId
  const authUser = useAuthStore.getState().user
  return profileCompanyId === companyId || authUser?.companyId === companyId
}

function emptyCatalogFor(company: Company): CompanyCatalog {
  return {
    products: [],
    reviews: [],
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
  return { ...catalog, [companyId]: { ...prev, ...patch } }
}

function syncActiveView(
  companyId: string,
  companies: Record<string, Company>,
  catalog: Record<string, CompanyCatalog>,
  bundle: RemoteBundle,
  isOwner: boolean,
) {
  const company = selectCompanyById(companies, companyId)
  if (!company) {
    return {
      activeCompanyId: companyId,
      company: null,
      products: [],
      reviews: [],
      gallery: [],
      galleryItems: [],
      enrichment: null,
      menuItemCount: 0,
      isCompanyOwner: isOwner,
      editMode: false,
      draftCompany: null,
    }
  }

  return {
    activeCompanyId: companyId,
    company: { ...company, whatsapp: bundle.enrichment?.whatsapp ?? company.whatsapp },
    products: bundle.products,
    reviews: bundle.reviews,
    gallery: bundle.gallery,
    galleryItems: bundle.galleryItems,
    enrichment: bundle.enrichment,
    menuItemCount: bundle.menuItemCount,
    isCompanyOwner: isOwner,
    editMode: false,
    draftCompany: null,
  }
}

async function loadRemoteBundle(placeId: string, company: Company): Promise<RemoteBundle> {
  if (placeId.startsWith('co-')) {
    const demo = selectCatalog(buildInitialCatalog(), placeId) ?? emptyCatalogFor(company)
    return {
      ...demo,
      enrichment: null,
      galleryItems: [],
      menuItemCount: 0,
    }
  }

  const [products, reviewRows, galleryItems, enrichment, menuItemCount] = await Promise.all([
    fetchBusinessProducts(placeId),
    fetchPlaceReviewsWithReplies(placeId),
    fetchBusinessGalleryItems(placeId),
    fetchBusinessEnrichment(placeId),
    countMenuItems(placeId),
  ])

  const reviews = placeReviewsToCompanyReviews(reviewRows)
  const googlePhotos = [company.coverImage, company.profileImage].filter(Boolean)
  const galleryUrls = galleryItems.map(g => g.imageUrl)
  const gallery = [...new Set([...galleryUrls, ...googlePhotos])]

  return {
    products,
    reviews,
    gallery,
    enrichment,
    galleryItems,
    menuItemCount,
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
      gallery: [],
      galleryItems: [],
      enrichment: null,
      menuItemCount: 0,
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
        set({
          loadingRemote: true,
          loadError: null,
          activeCompanyId: companyId,
          isCompanyOwner: isOwner,
        })

        const email =
          useAuthStore.getState().user?.email ?? useProfileStore.getState().user.email

        const remote = await fetchCompanyByPlaceId(companyId, email)

        if (!remote) {
          set({
            loadingRemote: false,
            loadError: 'Empresa no encontrada',
            company: null,
            products: [],
            reviews: [],
            gallery: [],
            galleryItems: [],
            enrichment: null,
            menuItemCount: 0,
            isCompanyOwner: isOwner,
          })
          return
        }

        const bundle = await loadRemoteBundle(companyId, remote)
        const mergedCompany: Company = {
          ...remote,
          whatsapp: bundle.enrichment?.whatsapp ?? remote.whatsapp,
        }
        const nextCompanies = { ...get().companies, [remote.id]: mergedCompany }
        const catalogSlice: CompanyCatalog = {
          products: bundle.products,
          reviews: bundle.reviews,
          gallery: bundle.gallery,
        }
        const nextCatalog = { ...get().catalog, [remote.id]: catalogSlice }

        set({
          companies: nextCompanies,
          catalog: nextCatalog,
          loadingRemote: false,
          loadError: null,
          ...syncActiveView(companyId, nextCompanies, nextCatalog, bundle, isOwner),
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

        const { email: _email, location, name: _name, category: _cat, ...editable } = draftCompany
        const updated: Company = {
          ...company,
          ...editable,
          name: company.name,
          category: company.category,
          email: company.email,
          location: {
            ...company.location,
            address: company.location.address,
          },
        }

        set({
          companies: { ...companies, [company.id]: updated },
          company: updated,
          editMode: false,
          draftCompany: null,
        })

        if (!updated.id.startsWith('co-')) {
          await saveBusinessContact({
            placeId: updated.id,
            description: updated.description,
            phone: updated.phone,
            website: updated.website,
            whatsapp: updated.whatsapp,
            emailCommercial: updated.email,
          })
          await updatePlaceFromCompany(updated)
        }
      },

      cancelEdit: () => set({ editMode: false, draftCompany: null }),

      addProduct: async product => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company || company.id.startsWith('co-')) return

        const result = await createBusinessProduct(company.id, product)
        if (!result.ok) {
          console.warn('[addProduct]', result.error)
          return
        }

        const next = [result.product, ...products]
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      updateProduct: async (id, patch) => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company || company.id.startsWith('co-')) return

        const result = await updateBusinessProduct(id, patch)
        if (!result.ok) {
          console.warn('[updateProduct]', result.error)
          return
        }

        const next = products.map(p => (p.id === id ? { ...p, ...patch } : p))
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      deleteProduct: async id => {
        if (!get().isCompanyOwner) return
        const { company, products, catalog } = get()
        if (!company || company.id.startsWith('co-')) return

        const result = await deleteBusinessProduct(id)
        if (!result.ok) {
          console.warn('[deleteProduct]', result.error)
          return
        }

        const next = products.filter(p => p.id !== id)
        set({
          products: next,
          catalog: patchCatalog(catalog, company.id, { products: next }),
        })
      },

      addGalleryImage: async (uri, tier) => {
        const { company } = get()
        if (!company || company.id.startsWith('co-')) return

        const result = await uploadBusinessGalleryImage(company.id, uri, tier)
        if (!result.ok) {
          console.warn('[addGalleryImage]', result.error)
          return
        }

        const galleryItems = [...get().galleryItems, result.item]
        const gallery = [...get().gallery, result.item.imageUrl]
        set({
          galleryItems,
          gallery,
          catalog: patchCatalog(get().catalog, company.id, { gallery }),
        })
      },

      removeGalleryImage: async itemId => {
        const { company, galleryItems, gallery } = get()
        if (!company) return

        const result = await deleteBusinessGalleryItem(itemId)
        if (!result.ok) {
          console.warn('[removeGalleryImage]', result.error)
          return
        }

        const removed = galleryItems.find(g => g.id === itemId)
        const nextItems = galleryItems.filter(g => g.id !== itemId)
        const nextGallery = removed
          ? gallery.filter(u => u !== removed.imageUrl)
          : gallery

        set({
          galleryItems: nextItems,
          gallery: nextGallery,
          catalog: patchCatalog(get().catalog, company.id, { gallery: nextGallery }),
        })
      },

      replyToReview: async (reviewId, reply) => {
        if (!get().isCompanyOwner) return
        const { company, reviews, catalog } = get()
        if (!company || company.id.startsWith('co-')) return

        const ownerId =
          useAuthStore.getState().user?.id ?? useProfileStore.getState().user.id
        if (!ownerId) return

        const result = await createReviewResponse({
          reviewId,
          businessId: company.id,
          ownerId,
          text: reply,
        })
        if (!result.ok) {
          console.warn('[replyToReview]', result.error)
          return
        }

        trackBusinessEvent({
          businessId: company.id,
          eventType: 'REVIEW_RESPONSE',
          userId: ownerId,
          metadata: { review_id: reviewId },
        })

        const next = reviews.map(r =>
          r.id === reviewId ? { ...r, companyReply: reply.trim() } : r,
        )
        set({
          reviews: next,
          catalog: patchCatalog(catalog, company.id, { reviews: next }),
        })
      },

      saveHours: async hours => {
        if (!get().isCompanyOwner) return { ok: false, error: 'Sin permiso' }
        const { company } = get()
        if (!company || company.id.startsWith('co-')) {
          return { ok: false, error: 'No disponible en demo' }
        }

        const result = await saveBusinessHours(company.id, hours)
        if (!result.ok) return result

        const enrichment = await fetchBusinessEnrichment(company.id)
        set({ enrichment })
        return { ok: true }
      },

      saveSocial: async social => {
        if (!get().isCompanyOwner) return { ok: false, error: 'Sin permiso' }
        const { company, enrichment } = get()
        if (!company || company.id.startsWith('co-')) {
          return { ok: false, error: 'No disponible en demo' }
        }

        const result = await saveBusinessSocial(company.id, social)
        if (!result.ok) return result

        set({
          enrichment: enrichment
            ? { ...enrichment, social: { ...enrichment.social, ...social } }
            : {
                placeId: company.id,
                whatsapp: null,
                phoneSecondary: null,
                emailCommercial: null,
                services: [],
                languages: [],
                paymentMethods: [],
                accessibility: [],
                amenities: [],
                hours: null,
                hoursComplete: false,
                social,
                updatedAt: new Date().toISOString(),
                googleSyncedAt: null,
              },
        })
        return { ok: true }
      },
    }),
    {
      name: 'trivai-company-registry',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ companies: state.companies }),
      merge: (persisted, current) => ({
        ...current,
        companies: mergeCompanies(
          (persisted as Partial<CompanyProfileStore> | undefined)?.companies ?? {},
        ),
        catalog: mergeCatalog({}),
      }),
    },
  ),
)

export function getCompanyById(companyId: string): Company | undefined {
  return selectCompanyById(useCompanyProfileStore.getState().companies, companyId)
}

export function getCompanyCatalogEntry(companyId: string): CompanyCatalog | undefined {
  return selectCatalog(useCompanyProfileStore.getState().catalog, companyId)
}

export const DEMO_COMPANY_ID = 'co-001'

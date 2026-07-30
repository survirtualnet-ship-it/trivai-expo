import type {
  Company,
  DashboardStats,
  Product,
  Review,
} from '../types'
import {
  MOCK_COMPANY,
  MOCK_GALLERY,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_STATS,
} from '../data/mockCompanyData'

export type CompanyCatalog = {
  products: Product[]
  reviews: Review[]
  stats: DashboardStats
  gallery: string[]
}

export function buildDemoCompany(): Company {
  return { ...MOCK_COMPANY, isDemoCompany: true }
}

export function buildInitialCompanies(): Record<string, Company> {
  return { [MOCK_COMPANY.id]: buildDemoCompany() }
}

export function buildInitialCatalog(): Record<string, CompanyCatalog> {
  return {
    [MOCK_COMPANY.id]: {
      products: MOCK_PRODUCTS,
      reviews: MOCK_REVIEWS,
      stats: MOCK_STATS,
      gallery: MOCK_GALLERY,
    },
  }
}

export function getCompanyById(
  companies: Record<string, Company>,
  companyId: string,
): Company | undefined {
  return companies[companyId]
}

export function getCompanyCatalog(
  catalog: Record<string, CompanyCatalog>,
  companyId: string,
): CompanyCatalog | undefined {
  return catalog[companyId]
}

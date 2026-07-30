export type CompanyLocation = {
  latitude: number
  longitude: number
  address: string
}

export type Company = {
  id: string
  name: string
  category: string
  description: string
  email: string
  location: CompanyLocation
  phone: string
  whatsapp: string
  website: string
  coverImage: string
  profileImage: string
  rating: number
  /** Built-in demo company (co-001) — read-only hints in UI */
  isDemoCompany?: boolean
}

export type Product = {
  id: string
  companyId: string
  name: string
  price: number
  image: string
  description: string
  category: string
  isFeatured: boolean
}

export type Review = {
  id: string
  userName: string
  rating: number
  comment: string
  companyReply?: string
  createdAt: string
}

export type DashboardStats = {
  views: number
  clicks: number
  saves: number
  rating: number
  weeklyViews: number[]
}

export type CompanyTab = 'home' | 'products' | 'gallery' | 'reviews' | 'dashboard'

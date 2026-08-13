/** Trivai-owned business enrichment — separate from Google canonical fields. */

export type SocialLinks = {
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  youtube?: string | null
  linkedin?: string | null
  x?: string | null
}

export type DayHoursSlot = { open: string; close: string }

export type DayHours = {
  closed?: boolean
  allDay?: boolean
  slots?: DayHoursSlot[]
}

export type BusinessHoursSchedule = {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
  temporarilyClosed?: boolean
  specialDates?: Record<string, DayHours>
}

export type BusinessEnrichment = {
  placeId: string
  whatsapp: string | null
  phoneSecondary: string | null
  emailCommercial: string | null
  services: string[]
  languages: string[]
  paymentMethods: string[]
  accessibility: string[]
  amenities: string[]
  hours: BusinessHoursSchedule | null
  hoursComplete: boolean
  social: SocialLinks
  updatedAt: string | null
  googleSyncedAt: string | null
}

export type GalleryItem = {
  id: string
  placeId: string
  imageUrl: string
  sortOrder: number
  isCover: boolean
  mediaType: 'image' | 'video'
  createdAt: string
}

export type MenuItem = {
  id: string
  sectionId: string
  name: string
  description: string | null
  price: number
  currency: string
  imageUrl: string | null
  sortOrder: number
  isAvailable: boolean
}

export type MenuSection = {
  id: string
  menuId: string
  name: string
  sortOrder: number
  items: MenuItem[]
}

export type BusinessMenu = {
  id: string
  placeId: string
  title: string
  sections: MenuSection[]
}

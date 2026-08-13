import type { Company } from '@/src/company/types'

const DICEBEAR = 'https://api.dicebear.com/7.x/initials/png'

type LogoInput = {
  name: string
  photos?: string[] | null
  customLogoUrl?: string | null
}

/** Business avatar: custom logo → Google photo → initial. */
export function resolveBusinessLogoUrl(input: LogoInput): string {
  if (input.customLogoUrl?.trim()) return input.customLogoUrl.trim()
  const photo = input.photos?.[0]
  if (photo?.trim()) return photo.trim()
  const seed = encodeURIComponent(input.name.trim() || 'Negocio')
  return `${DICEBEAR}?seed=${seed}&backgroundColor=6C4CF1&textColor=ffffff`
}

export function businessInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'N'
  return trimmed.charAt(0).toUpperCase()
}

const PLACEHOLDER_PHOTO = /unsplash\.com/i

function isRealPhoto(url: string | undefined | null): boolean {
  const value = url?.trim()
  if (!value) return false
  return !PLACEHOLDER_PHOTO.test(value)
}

export function companyLogoFromRecord(
  company: Pick<Company, 'name' | 'profileImage' | 'coverImage' | 'customLogoUrl'>,
): string {
  if (company.customLogoUrl?.trim()) return company.customLogoUrl.trim()
  if (isRealPhoto(company.profileImage)) return company.profileImage.trim()
  if (isRealPhoto(company.coverImage)) return company.coverImage.trim()
  return resolveBusinessLogoUrl({ name: company.name })
}

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

export function companyLogoFromRecord(
  company: Pick<Company, 'name' | 'profileImage' | 'customLogoUrl'>,
): string {
  if (company.customLogoUrl?.trim()) return company.customLogoUrl.trim()
  if (company.profileImage?.trim()) return company.profileImage.trim()
  return resolveBusinessLogoUrl({ name: company.name })
}

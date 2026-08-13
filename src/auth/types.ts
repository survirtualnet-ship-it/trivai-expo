import type { UserRole, LegacyUserRole } from '@/lib/domain/user'

/** @deprecated Use UserRole from lib/domain — 'business' replaces 'company'. */
export type AuthRole = UserRole | LegacyUserRole

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  /** @deprecated Use activeBusinessId */
  companyId?: string
  activeBusinessId?: string
  businessIds?: string[]
}

export type LoginPayload = AuthUser & {
  token?: string
}

/**
 * User domain — authenticated identities only.
 * Anonymous guests have NO User record and NO role.
 */

/** App user roles. Admin exists for future BackOffice only — never in mobile nav. */
export type UserRole = 'tourist' | 'business' | 'admin'

/** @deprecated Legacy alias — use 'business'. Kept for persisted stores / migrations. */
export type LegacyUserRole = 'company'

export type AppUser = {
  id: string
  role: UserRole
  email: string
  name: string
  avatar?: string | null
  /** Primary / active business (Supabase place UUID). Legacy: companyId. */
  activeBusinessId?: string | null
  /** All owned businesses — populated when loaded from trivai_business. */
  businessIds?: string[]
}

/** Maps DB account_type → app role. */
export function roleFromAccountType(
  accountType: 'personal' | 'business' | null | undefined,
): UserRole | null {
  if (!accountType) return null
  return accountType === 'business' ? 'business' : 'tourist'
}

/** Normalize legacy 'company' → 'business'. */
export function normalizeUserRole(
  role: UserRole | LegacyUserRole | string | null | undefined,
): UserRole | null {
  if (!role) return null
  if (role === 'company') return 'business'
  if (role === 'tourist' || role === 'business' || role === 'admin') return role
  return null
}

export function isBusinessUser(
  role: UserRole | LegacyUserRole | string | null | undefined,
): boolean {
  return normalizeUserRole(role) === 'business'
}

export function isTouristUser(
  role: UserRole | LegacyUserRole | string | null | undefined,
): boolean {
  return normalizeUserRole(role) === 'tourist'
}

export function isAdminUser(
  role: UserRole | LegacyUserRole | string | null | undefined,
): boolean {
  return normalizeUserRole(role) === 'admin'
}

/** Build AppUser from auth session pieces. */
export function buildAppUser(input: {
  id: string
  email: string
  name: string
  avatar?: string | null
  accountType?: 'personal' | 'business' | null
  activeBusinessId?: string | null
  businessIds?: string[]
}): AppUser {
  const role = roleFromAccountType(input.accountType) ?? 'tourist'
  return {
    id: input.id,
    role,
    email: input.email,
    name: input.name,
    avatar: input.avatar,
    activeBusinessId: input.activeBusinessId ?? null,
    businessIds: input.businessIds ?? [],
  }
}

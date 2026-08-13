/**
 * Administrator domain — BackOffice web only.
 * No screens, routes, or navigation in the mobile app.
 */

import type { UserRole } from './user'

export type AdminPermission =
  | 'moderate_reviews'
  | 'moderate_users'
  | 'manage_business_claims'
  | 'manage_subscriptions'
  | 'view_platform_analytics'
  | 'manage_legal_versions'
  | 'manage_feature_flags'

export type AdminRole = 'super_admin' | 'moderator' | 'support'

export type BackOfficeAdmin = {
  id: string
  email: string
  name: string
  adminRole: AdminRole
  permissions: AdminPermission[]
}

/** Guard for future BackOffice — never invoked from Expo Router. */
export function assertNotMobileAdmin(role: UserRole | null): void {
  if (role === 'admin') {
    console.warn(
      '[Trivai] Admin role detected in mobile client — use BackOffice web only.',
    )
  }
}

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'moderate_reviews',
    'moderate_users',
    'manage_business_claims',
    'manage_subscriptions',
    'view_platform_analytics',
    'manage_legal_versions',
    'manage_feature_flags',
  ],
  moderator: ['moderate_reviews', 'moderate_users', 'manage_business_claims'],
  support: ['manage_business_claims', 'manage_subscriptions'],
}

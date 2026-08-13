import { useMemo } from 'react'
import { useUser } from '@/hooks/useUser'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import {
  createAuthContext,
  createGuestContext,
  type PermissionContext,
} from '@/lib/domain/permissions'
import { normalizeUserRole, isBusinessUser } from '@/lib/domain/user'

/** Permission context for the current session (guest = no User, no role). */
export function usePermissions(): PermissionContext & {
  isBusinessUser: boolean
  isTourist: boolean
  activeBusinessId: string | null
} {
  const { user, profile } = useUser()
  const storeUser = useProfileStore(s => s.user)

  return useMemo(() => {
    if (!user) {
      return {
        ...createGuestContext(),
        isBusinessUser: false,
        isTourist: false,
        activeBusinessId: null,
      }
    }

    const role =
      normalizeUserRole(roleFromProfileSafe(profile, storeUser.role)) ?? 'tourist'
    const ctx = createAuthContext(user.id, role)
    const activeBusinessId =
      profile?.business_place_id ??
      storeUser.activeBusinessId ??
      storeUser.companyId ??
      null

    return {
      ...ctx,
      isBusinessUser: isBusinessUser(role),
      isTourist: role === 'tourist',
      activeBusinessId,
    }
  }, [user, profile, storeUser.role, storeUser.activeBusinessId, storeUser.companyId])
}

function roleFromProfileSafe(
  profile: { account_type?: string | null } | null,
  fallback: string,
): string {
  if (profile?.account_type === 'business') return 'business'
  if (profile?.account_type === 'personal') return 'tourist'
  return fallback
}

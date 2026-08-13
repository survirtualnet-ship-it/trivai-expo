import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { roleFromAccountType, normalizeUserRole } from '@/lib/domain/user'
import type { UserRole } from './types'

function initialsFromName(name: string): string {
  return (
    name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  )
}

/** @deprecated Prefer roleFromAccountType from lib/domain/user */
export function roleFromProfile(profile: Profile | null): UserRole | null {
  return roleFromAccountType(profile?.account_type)
}

export function isOnboardingCompleteFromProfile(profile: Profile | null): boolean {
  return profile?.account_type != null
}

/** Hydrate local profile store from Supabase session (existing users). */
export function syncProfileStoreFromAuth(
  user: User,
  profile: Profile | null,
): void {
  const prev = useProfileStore.getState().user
  const sameUser = !!prev.id && prev.id === user.id

  const name =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Explorador'

  const avatarUrl =
    profile?.avatar_url ??
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    ''

  // Supabase profile is source of truth. Never inherit companyId/role from
  // another account left in AsyncStorage / localStorage.
  const roleFromDb = roleFromProfile(profile)
  const role: UserRole =
    roleFromDb ??
    normalizeUserRole(profile ? 'tourist' : sameUser ? prev.role : 'tourist') ??
    'tourist'

  const activeBusinessId =
    profile != null
      ? profile.business_place_id ?? undefined
      : sameUser
        ? prev.activeBusinessId ?? prev.companyId
        : undefined

  const businessIds =
    profile != null
      ? activeBusinessId
        ? [activeBusinessId, ...(prev.businessIds ?? []).filter(id => id !== activeBusinessId)]
        : prev.businessIds
      : sameUser
        ? prev.businessIds
        : []

  const onboardingCompleted =
    isOnboardingCompleteFromProfile(profile) ||
    (sameUser && prev.onboardingCompleted)

  useProfileStore.getState().setUser({
    id: user.id,
    name,
    email: user.email ?? undefined,
    avatarUrl,
    photo: avatarUrl || undefined,
    initials: initialsFromName(name),
    city: profile?.city?.trim() || (sameUser ? prev.city : ''),
    role,
    companyId: activeBusinessId,
    activeBusinessId,
    businessIds: businessIds ?? [],
    onboardingCompleted,
  })
}

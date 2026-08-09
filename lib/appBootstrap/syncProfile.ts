import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
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

export function roleFromProfile(profile: Profile | null): UserRole | null {
  if (!profile?.account_type) return null
  return profile.account_type === 'business' ? 'company' : 'tourist'
}

export function isOnboardingCompleteFromProfile(profile: Profile | null): boolean {
  return profile?.account_type != null
}

/** Hydrate local profile store from Supabase session (existing users). */
export function syncProfileStoreFromAuth(
  user: User,
  profile: Profile | null,
): void {
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

  const role = roleFromProfile(profile) ?? useProfileStore.getState().user.role
  const onboardingCompleted =
    isOnboardingCompleteFromProfile(profile) ||
    useProfileStore.getState().user.onboardingCompleted

  useProfileStore.getState().setUser({
    id: user.id,
    name,
    email: user.email ?? undefined,
    avatarUrl,
    photo: avatarUrl || undefined,
    initials: initialsFromName(name),
    city: profile?.city?.trim() || '',
    role,
    companyId: profile?.business_place_id ?? useProfileStore.getState().user.companyId,
    onboardingCompleted,
  })
}

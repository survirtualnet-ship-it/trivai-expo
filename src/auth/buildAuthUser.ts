import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import type { AuthUser } from './types'
import { roleFromProfile } from '@/lib/appBootstrap/syncProfile'

export function buildAuthUser(
  user: User,
  profile: Profile | null,
): AuthUser {
  const meta = user.user_metadata ?? {}
  const name =
    profile?.full_name ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Explorador'

  // Only trust Supabase profile — never leak companyId from a prior local user.
  const role = roleFromProfile(profile) ?? 'tourist'
  const companyId = profile?.business_place_id ?? undefined

  return {
    id: user.id,
    name,
    email: user.email ?? '',
    role,
    companyId,
  }
}

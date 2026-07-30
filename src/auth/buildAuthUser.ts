import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import type { AuthUser } from './types'
import { roleFromProfile } from '@/lib/appBootstrap/syncProfile'
import { useProfileStore } from '@/src/profile/store/useProfileStore'

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

  const localRole = useProfileStore.getState().user.role
  const role = roleFromProfile(profile) ?? localRole ?? 'tourist'

  return {
    id: user.id,
    name,
    email: user.email ?? '',
    role,
    companyId:
      profile?.business_place_id ??
      useProfileStore.getState().user.companyId ??
      undefined,
  }
}

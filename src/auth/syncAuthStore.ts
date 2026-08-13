import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { buildAuthUser } from '@/src/auth/buildAuthUser'
import { useAuthStore } from '@/src/auth/store/useAuthStore'

/** Sync Zustand auth store after Supabase sign-in or profile update. */
export async function syncAuthStoreFromSession(
  user: User,
  profile: Profile | null,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  const authUser = buildAuthUser(user, profile)

  useAuthStore.getState().login({
    ...authUser,
    token: session?.access_token,
  })
}

import type { UserRole } from '@/lib/domain/user'

/** Update auth store when onboarding assigns role / activeBusinessId. */
export function syncAuthStoreFromProfile(patch: {
  id: string
  name?: string
  email?: string
  role: UserRole | 'company'
  companyId?: string
  activeBusinessId?: string
}): void {
  const current = useAuthStore.getState().user
  const activeBusinessId = patch.activeBusinessId ?? patch.companyId
  useAuthStore.getState().login({
    id: patch.id,
    name: patch.name ?? current?.name ?? 'Explorador',
    email: patch.email ?? current?.email ?? '',
    role: patch.role === 'company' ? 'business' : patch.role,
    companyId: activeBusinessId,
    activeBusinessId,
    token: useAuthStore.getState().token ?? undefined,
  })
}

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

/** Update auth store when onboarding assigns role / companyId. */
export function syncAuthStoreFromProfile(patch: {
  id: string
  name?: string
  email?: string
  role: 'tourist' | 'company'
  companyId?: string
}): void {
  const current = useAuthStore.getState().user
  useAuthStore.getState().login({
    id: patch.id,
    name: patch.name ?? current?.name ?? 'Explorador',
    email: patch.email ?? current?.email ?? '',
    role: patch.role,
    companyId: patch.companyId,
    token: useAuthStore.getState().token ?? undefined,
  })
}

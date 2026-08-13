import { supabase } from '@/lib/supabase'
import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { syncAuthStoreFromProfile } from '@/src/auth/syncAuthStore'

/** Set primary business for multi-business empresa users (profiles.business_place_id). */
export async function setActiveBusiness(
  userId: string,
  placeId: string,
  businessName?: string,
): Promise<void> {
  const patch: Record<string, string> = {
    business_place_id: placeId,
    updated_at: new Date().toISOString(),
  }
  if (businessName) patch.business_name = businessName

  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)

  if (error) throw new Error(error.message)

  const prev = useProfileStore.getState().user
  const businessIds = Array.from(
    new Set([placeId, ...(prev.businessIds ?? []), prev.activeBusinessId, prev.companyId].filter(Boolean) as string[]),
  )

  useProfileStore.getState().setUser({
    role: 'business',
    activeBusinessId: placeId,
    companyId: placeId,
    businessIds,
  })

  syncAuthStoreFromProfile({
    id: userId,
    role: 'business',
    companyId: placeId,
    activeBusinessId: placeId,
  })
}

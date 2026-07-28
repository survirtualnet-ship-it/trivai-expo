import type { User } from '@supabase/supabase-js'
import { supabase, type Profile } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'

export interface UserSession {
  user: User | null
  profile: Profile | null
}

async function backfillGoogleFields(user: User, existing: Profile): Promise<Profile> {
  const meta = user.user_metadata ?? {}
  const fullName =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    ''
  const username = (meta.email || user.email || '')
    .split('@')[0]
    .replace(/[^a-z0-9_.]/gi, '')
    .toLowerCase()
  const avatarUrl =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null

  const needsUpdate =
    (!existing.username && username) ||
    (!existing.avatar_url && avatarUrl) ||
    (!existing.full_name && fullName)

  if (!needsUpdate) return existing

  const updates: Record<string, string> = { updated_at: new Date().toISOString() }
  if (!existing.username && username) updates.username = username
  if (!existing.avatar_url && avatarUrl) updates.avatar_url = avatarUrl
  if (!existing.full_name && fullName) updates.full_name = fullName

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) throw error
  return (updated ?? existing) as Profile
}

export async function fetchCurrentUserSession(): Promise<UserSession> {
  const { data: { session } } = await supabase.auth.getSession()
  const authUser = session?.user ?? null

  if (!authUser) {
    return { user: null, profile: null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) throw error

  if (data) {
    const profile = await backfillGoogleFields(authUser, data as Profile)
    return { user: authUser, profile }
  }

  const ensured = await ensureProfile(authUser)
  return { user: authUser, profile: ensured }
}

export async function fetchProfileById(id: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, city, avatar_url')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Profile
}

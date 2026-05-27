import type { User } from '@supabase/supabase-js'
import { supabase, type Profile } from '@/lib/supabase'

function slugUsername(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_.]/g, '')
    .slice(0, 24) || 'explorador'
}

function profileFromAuthUser(user: User): Omit<Profile, 'created_at'> & { updated_at: string } {
  const meta = user.user_metadata ?? {}
  const fullName =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Explorador'
  const baseUsername =
    (meta.username as string | undefined) ??
    user.email?.split('@')[0] ??
    fullName
  const avatarUrl =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null

  return {
    id: user.id,
    full_name: fullName,
    username: slugUsername(baseUsername),
    avatar_url: avatarUrl,
    bio: null,
    city: 'Santa Cruz',
    plan: 'free',
    xp_points: 0,
    account_type: 'personal',
    business_name: null,
    business_address: null,
    business_lat: null,
    business_lng: null,
    business_phone: null,
    business_website: null,
    business_category: null,
    updated_at: new Date().toISOString(),
  }
}

/** Crea o devuelve el perfil en `profiles` (p. ej. tras login con Google). */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) return existing as Profile

  const draft = profileFromAuthUser(user)
  const { data: created, error } = await supabase
    .from('profiles')
    .upsert(draft, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    console.warn('ensureProfile:', error.message)
    return null
  }

  return created as Profile
}

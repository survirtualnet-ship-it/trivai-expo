import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    setUser(authUser)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (data) {
      setProfile(data as Profile)
      setLoading(false)
      return
    }

    const ensured = await ensureProfile(authUser)
    setProfile(ensured)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load()
    })
    return () => subscription.unsubscribe()
  }, [load])

  const meta = user?.user_metadata ?? {}
  const fallbackName =
    profile?.full_name ??
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Explorador'

  const displayName = fallbackName.split(' ')[0]
  const initials = fallbackName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const avatarUrl =
    profile?.avatar_url ??
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null

  const isBusiness = profile?.account_type === 'business'
  const isAuthenticated = !!user

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    displayName,
    initials,
    avatarUrl,
    isBusiness,
    signOut,
    refreshProfile: load,
  }
}

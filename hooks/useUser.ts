import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load())
    return () => subscription.unsubscribe()
  }, [])

  const displayName = profile?.full_name?.split(' ')[0] ?? 'Explorador'
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'
  const isBusiness = profile?.account_type === 'business'

  const signOut = async () => { await supabase.auth.signOut() }

  return { profile, loading, displayName, initials, isBusiness, signOut }
}

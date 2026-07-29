/**
 * Supabase client entry for the services layer.
 * Session persistence uses AsyncStorage (native) / localStorage (web) — configured in lib/supabase.
 */
export { supabase, isSupabaseConfigured } from '@/lib/supabase'
export type { Profile, Place as DbPlace, Event, Plan } from '@/lib/supabase'

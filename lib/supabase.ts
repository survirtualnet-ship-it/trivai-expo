import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv, isSupabaseConfigured } from '@/lib/env'

export { isSupabaseConfigured }

const cfg = getSupabaseEnv()
const supabaseUrl  = cfg?.url ?? 'https://placeholder.supabase.co'
const supabaseKey  = cfg?.key ?? 'placeholder-anon-key'

// En web usar localStorage nativo directamente para que PKCE funcione
// (AsyncStorage añade una capa async que puede perder el code_verifier entre redirecciones)
const webStorage = typeof window !== 'undefined' ? window.localStorage : undefined

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage:           Platform.OS === 'web' ? (webStorage as any) : AsyncStorage,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType:          'pkce',
  },
})

// ─── TIPOS (mismos que en trivai web) ────────────────────────

export type Plan = 'free' | 'premium' | 'explorer' | 'business'

export interface Profile {
  id:                string
  username:          string
  full_name:         string
  avatar_url:        string | null
  bio:               string | null
  city:              string
  plan:              Plan
  xp_points:         number
  account_type:      'personal' | 'business' | null
  business_name:     string | null
  business_address:  string | null
  business_lat:      number | null
  business_lng:      number | null
  business_phone:    string | null
  business_website:  string | null
  business_category: string | null
  created_at:        string
}

export interface Place {
  id:           string
  name:         string
  description:  string | null
  category:     string
  address:      string | null
  city:         string
  latitude:     number | null
  longitude:    number | null
  phone:        string | null
  website:      string | null
  hours:        Record<string, string> | null
  photos:       string[]
  rating_avg:   number
  rating_count: number
  is_open:      boolean
  is_sponsored: boolean
  is_verified:  boolean
}

export interface Event {
  id:              string
  name:            string
  description:     string | null
  category:        string
  place_id:        string | null
  start_datetime:  string
  end_datetime:    string | null
  price:           number
  is_free:         boolean
  attendees_count: number
  photos:          string[]
  is_featured:     boolean
  is_active:       boolean
  place?:          Pick<Place, 'id' | 'name' | 'address'>
}

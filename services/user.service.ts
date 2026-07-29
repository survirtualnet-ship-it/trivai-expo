import { supabase } from '@/services/supabase'
import type { User, AppTheme } from '@/types/user'
import type { Profile } from '@/lib/supabase'
import { signInWithGoogle } from '@/lib/auth/googleOAuth'

const PREFS_KEY_PREFIX = 'trivai.user.prefs.'

type LocalPrefs = {
  share_location: boolean
  share_activity: boolean
  language: string
  theme: AppTheme
}

const DEFAULT_PREFS: LocalPrefs = {
  share_location: false,
  share_activity: true,
  language: 'es',
  theme: 'light',
}

async function loadLocalPrefs(userId: string): Promise<LocalPrefs> {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
    const raw = await AsyncStorage.getItem(PREFS_KEY_PREFIX + userId)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

export async function saveLocalPrefs(
  userId: string,
  patch: Partial<LocalPrefs>,
): Promise<LocalPrefs> {
  const current = await loadLocalPrefs(userId)
  const next = { ...current, ...patch }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
  await AsyncStorage.setItem(PREFS_KEY_PREFIX + userId, JSON.stringify(next))
  return next
}

export function mapProfileToUser(
  profile: Profile | null,
  authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  prefs: LocalPrefs = DEFAULT_PREFS,
): User {
  const meta = authUser.user_metadata ?? {}
  const name =
    profile?.full_name
    || (meta.full_name as string | undefined)
    || (meta.name as string | undefined)
    || authUser.email?.split('@')[0]
    || 'Explorador'

  const avatar =
    profile?.avatar_url
    || (meta.avatar_url as string | undefined)
    || (meta.picture as string | undefined)
    || ''

  return {
    id: authUser.id,
    name,
    avatar_url: avatar,
    share_location: prefs.share_location,
    share_activity: prefs.share_activity,
    language: prefs.language,
    theme: prefs.theme,
    email: authUser.email ?? null,
    city: profile?.city ?? null,
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  const prefs = await loadLocalPrefs(session.user.id)
  return mapProfileToUser(profile as Profile | null, session.user, prefs)
}

export async function signInGoogle(): Promise<void> {
  await signInWithGoogle()
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut()
}

export async function updateUserPrefs(
  userId: string,
  patch: Partial<Pick<User, 'share_location' | 'share_activity' | 'language' | 'theme'>>,
): Promise<LocalPrefs> {
  return saveLocalPrefs(userId, patch)
}

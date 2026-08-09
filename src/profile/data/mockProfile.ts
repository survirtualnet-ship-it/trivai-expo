import type { ProfileSettings, ProfileUser } from '../store/useProfileStore'

/** Guest / cleared session — never show a fake celebrity identity. */
export const EMPTY_USER: ProfileUser = {
  id: '',
  name: '',
  avatarUrl: '',
  initials: '',
  city: '',
  travelerType: 'Explorer',
  role: 'tourist',
  onboardingCompleted: false,
}

/** @deprecated use EMPTY_USER — kept so older imports compile during cleanup */
export const MOCK_USER = EMPTY_USER

/** Local-only defaults (not synced to Supabase). */
export const DEFAULT_SETTINGS: ProfileSettings = {
  language: 'Español',
  currency: 'BOB',
  notifications: true,
  privacy: false,
}

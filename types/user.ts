/** Domain User model for TRIVAI auth + preferences */

export type AppTheme = 'light' | 'dark'

export type User = {
  id: string
  name: string
  avatar_url: string
  share_location: boolean
  share_activity: boolean
  language: string
  theme: AppTheme
  email?: string | null
  city?: string | null
}

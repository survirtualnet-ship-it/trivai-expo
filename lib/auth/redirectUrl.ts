import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

/** URL de callback OAuth / confirmación email / reset password */
export function getAuthRedirectUrl(path = 'auth/callback'): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${path.replace(/^\//, '')}`
  }
  return Linking.createURL(path.replace(/^\//, ''))
}

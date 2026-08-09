/** Isolated config — reads env without importing app lib/ */
export const ONBOARDING_CONFIG = {
  googleMapsKey:
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY?.trim() ?? 'YOUR_GOOGLE_PLACES_API_KEY',
  googleWebClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '',
  defaultCity: '',
} as const

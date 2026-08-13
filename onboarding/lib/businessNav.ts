import { router } from 'expo-router'

type BusinessRoute =
  | 'BusinessGoogleLogin'
  | 'BusinessSearch'
  | 'BusinessVerify'
  | 'BusinessSetup'
  | 'BusinessDone'
  | 'BusinessPlan'

const ROUTES: Record<BusinessRoute, string> = {
  BusinessGoogleLogin: '/empresa/onboarding/login',
  BusinessSearch: '/empresa/onboarding/search',
  BusinessVerify: '/empresa/onboarding/verify',
  BusinessSetup: '/empresa/onboarding/setup',
  BusinessDone: '/empresa/onboarding/done',
  BusinessPlan: '/empresa/plan',
}

/**
 * Expo Router shim for legacy React Navigation business onboarding screens.
 * Avoids nested NavigationContainer (blank screen under Expo Router / web).
 */
export function useBusinessOnboardingNavigation() {
  return {
    navigate: (route: BusinessRoute) => {
      router.push(ROUTES[route] as never)
    },
    goBack: () => {
      if (router.canGoBack()) router.back()
      else router.replace('/empresa/mi-negocio')
    },
    replace: (route: BusinessRoute) => {
      router.replace(ROUTES[route] as never)
    },
  }
}

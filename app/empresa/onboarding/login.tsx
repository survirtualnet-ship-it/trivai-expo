import { GoogleLoginScreen } from '@/onboarding/screens/business/GoogleLoginScreen'
import { useBusinessOnboardingNavigation } from '@/onboarding/lib/businessNav'

export default function BusinessOnboardingLoginRoute() {
  const navigation = useBusinessOnboardingNavigation()
  return <GoogleLoginScreen navigation={navigation as never} route={undefined as never} />
}

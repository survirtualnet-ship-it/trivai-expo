import { BusinessVerifyScreen } from '@/onboarding/screens/business/BusinessVerifyScreen'
import { useBusinessOnboardingNavigation } from '@/onboarding/lib/businessNav'

export default function BusinessOnboardingVerifyRoute() {
  const navigation = useBusinessOnboardingNavigation()
  return <BusinessVerifyScreen navigation={navigation as never} route={undefined as never} />
}

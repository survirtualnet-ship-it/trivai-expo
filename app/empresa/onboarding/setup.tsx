import { BusinessSetupScreen } from '@/onboarding/screens/business/BusinessSetupScreen'
import { useBusinessOnboardingNavigation } from '@/onboarding/lib/businessNav'

export default function BusinessOnboardingSetupRoute() {
  const navigation = useBusinessOnboardingNavigation()
  return <BusinessSetupScreen navigation={navigation as never} route={undefined as never} />
}

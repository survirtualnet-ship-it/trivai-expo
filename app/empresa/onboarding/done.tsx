import { BusinessDoneScreen } from '@/onboarding/screens/business/DoneScreen'
import { useBusinessOnboardingNavigation } from '@/onboarding/lib/businessNav'

export default function BusinessOnboardingDoneRoute() {
  const navigation = useBusinessOnboardingNavigation()
  return <BusinessDoneScreen navigation={navigation as never} route={undefined as never} />
}

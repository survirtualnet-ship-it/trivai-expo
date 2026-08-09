import { BusinessSearchScreen } from '@/onboarding/screens/business/BusinessSearchScreen'
import { useBusinessOnboardingNavigation } from '@/onboarding/lib/businessNav'

export default function BusinessOnboardingSearchRoute() {
  const navigation = useBusinessOnboardingNavigation()
  return <BusinessSearchScreen navigation={navigation as never} route={undefined as never} />
}

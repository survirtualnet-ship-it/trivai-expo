import { ChoosePlanScreen } from '@/src/company/screens/ChoosePlanScreen'
import { useLocalSearchParams } from 'expo-router'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { completeBusinessOnboarding } from '@/lib/appBootstrap'
import { useUser } from '@/hooks/useUser'

/** Plan selector inside tabs — keeps bottom navigation visible. */
export default function EmpresaPlanTab() {
  const { placeId, name, from } = useLocalSearchParams<{
    placeId: string
    name?: string
    from?: string
  }>()
  const businessData = useOnboardingStore(s => s.businessData)
  const { user, profile } = useUser()

  if (!placeId) return null

  const displayName = name ?? businessData?.name
  const isOnboarding = from === 'onboarding'

  return (
    <ChoosePlanScreen
      placeId={placeId}
      businessName={displayName}
      mode={isOnboarding ? 'onboarding' : 'manage'}
      onComplete={
        isOnboarding && user?.id
          ? async id => {
              await completeBusinessOnboarding({
                userId: user.id,
                email: user.email,
                name: profile?.full_name ?? user.email?.split('@')[0],
                companyId: id,
                businessName: displayName,
                destinationOverride: `/empresa/${id}`,
              })
            }
          : undefined
      }
    />
  )
}

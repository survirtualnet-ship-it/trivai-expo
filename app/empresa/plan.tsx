import { ChoosePlanScreen } from '@/src/company/screens/ChoosePlanScreen'
import { useLocalSearchParams, router } from 'expo-router'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { completeBusinessOnboarding } from '@/lib/appBootstrap'
import { useUser } from '@/hooks/useUser'

/** Post-claim subscription — separate from Claim flow. */
export default function EmpresaPlanRoute() {
  const { placeId, name } = useLocalSearchParams<{ placeId: string; name?: string }>()
  const businessData = useOnboardingStore(s => s.businessData)
  const { user, profile } = useUser()

  if (!placeId) return null

  const displayName = name ?? businessData?.name

  return (
    <ChoosePlanScreen
      placeId={placeId}
      businessName={displayName}
      onComplete={async id => {
        if (user?.id) {
          await completeBusinessOnboarding({
            userId: user.id,
            email: user.email,
            name: profile?.full_name ?? user.email?.split('@')[0],
            companyId: id,
            businessName: displayName,
            destinationOverride: `/empresa/${id}`,
          })
          return
        }
        router.replace(`/empresa/${id}`)
      }}
    />
  )
}

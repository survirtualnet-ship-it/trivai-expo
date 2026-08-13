import { Redirect, useLocalSearchParams } from 'expo-router'

/** @deprecated Use /empresa/plan */
export default function OnboardingPlanRedirect() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>()
  if (!placeId) return null
  return <Redirect href={{ pathname: '/empresa/plan', params: { placeId } }} />
}

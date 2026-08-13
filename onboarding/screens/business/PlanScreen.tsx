import { Redirect, useLocalSearchParams } from 'expo-router'

/** @deprecated Use ChoosePlanScreen via /empresa/plan */
export function BusinessPlanScreen({ placeId: placeIdProp }: { placeId?: string }) {
  const { placeId: placeIdParam } = useLocalSearchParams<{ placeId: string }>()
  const placeId = placeIdProp ?? placeIdParam
  if (!placeId) return null
  return <Redirect href={{ pathname: '/empresa/plan', params: { placeId } }} />
}

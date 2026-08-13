import { Redirect, useLocalSearchParams } from 'expo-router'

/** Subscription management — redirects to tab plan selector. */
export default function EmpresaSuscripcionRoute() {
  const { placeId, name } = useLocalSearchParams<{ placeId: string; name?: string }>()
  if (!placeId) return null
  return (
    <Redirect
      href={{
        pathname: '/(tabs)/empresa-plan',
        params: { placeId, ...(name ? { name } : {}) },
      }}
    />
  )
}

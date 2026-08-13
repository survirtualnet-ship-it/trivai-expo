import { Redirect, useLocalSearchParams } from 'expo-router'

/** Subscription management — redirects to plan selector until billing is wired. */
export default function EmpresaSuscripcionRoute() {
  const { placeId, name } = useLocalSearchParams<{ placeId: string; name?: string }>()
  if (!placeId) return null
  return (
    <Redirect
      href={{
        pathname: '/empresa/plan',
        params: { placeId, ...(name ? { name } : {}) },
      }}
    />
  )
}

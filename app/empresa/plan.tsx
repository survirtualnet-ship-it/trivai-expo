import { Redirect, useLocalSearchParams } from 'expo-router'

/** Legacy route — redirects to tab screen so bottom nav stays visible. */
export default function EmpresaPlanRoute() {
  const { placeId, name, from } = useLocalSearchParams<{
    placeId: string
    name?: string
    from?: string
  }>()
  if (!placeId) return null
  return (
    <Redirect
      href={{
        pathname: '/(tabs)/empresa-plan',
        params: {
          placeId,
          ...(name ? { name } : {}),
          ...(from ? { from } : {}),
        },
      }}
    />
  )
}

import { Redirect } from 'expo-router'
import { ActividadesScreen } from '@/src/screens/ActividadesScreen'
import { usePermissions } from '@/hooks/usePermissions'

/** Tourist-only tab — business users redirect to Inicio. */
export default function ActividadesTab() {
  const { isBusinessUser } = usePermissions()
  if (isBusinessUser) return <Redirect href="/(tabs)/" />
  return <ActividadesScreen />
}

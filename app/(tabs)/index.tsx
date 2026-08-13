import { InicioScreen } from '@/src/screens/InicioScreen'
import { BusinessHomeScreen } from '@/src/company/screens/BusinessHomeScreen'
import { MyBusinessEmptyScreen } from '@/src/company/screens/MyBusinessEmptyScreen'
import { usePermissions } from '@/hooks/usePermissions'

/** Tourist → discovery home. Business → exclusive dashboard home. */
export default function HomeTab() {
  const { isBusinessUser, activeBusinessId } = usePermissions()

  if (isBusinessUser) {
    if (!activeBusinessId) return <MyBusinessEmptyScreen />
    return <BusinessHomeScreen placeId={activeBusinessId} />
  }

  return <InicioScreen />
}

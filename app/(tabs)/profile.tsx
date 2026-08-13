import { PerfilScreen } from '@/src/screens/PerfilScreen'
import { BusinessProfileScreen } from '@/src/company/screens/BusinessProfileScreen'
import { usePermissions } from '@/hooks/usePermissions'

/** Tourist → personal profile. Business → business profile (not owner). */
export default function ProfileTab() {
  const { isBusinessUser } = usePermissions()

  if (isBusinessUser) {
    return <BusinessProfileScreen />
  }

  return <PerfilScreen />
}

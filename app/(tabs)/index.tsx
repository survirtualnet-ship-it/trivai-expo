import { InicioScreen } from '@/src/screens/InicioScreen'
import { BusinessHomeScreen } from '@/src/company/screens/BusinessHomeScreen'
import { MyBusinessEmptyScreen } from '@/src/company/screens/MyBusinessEmptyScreen'
import { SplashScreen } from '@/components/SplashScreen'
import { usePermissions } from '@/hooks/usePermissions'
import { useUser } from '@/hooks/useUser'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { isBusinessUser } from '@/lib/domain/user'

/** Tourist → discovery home. Business → exclusive dashboard home. */
export default function HomeTab() {
  const { isBusinessUser: isBusiness, activeBusinessId } = usePermissions()
  const { loading: userLoading } = useUser()
  const authUser = useAuthStore(s => s.user)
  const authLoading = useAuthStore(s => s.isLoading)

  const resolvedBusinessId =
    activeBusinessId ?? authUser?.activeBusinessId ?? authUser?.companyId ?? null
  const resolvedBusiness =
    isBusiness || (isBusinessUser(authUser?.role) && !!resolvedBusinessId)

  const resolvingBusinessSession =
    resolvedBusiness &&
    !resolvedBusinessId &&
    (userLoading || authLoading)

  const waitingForBusinessProfile =
    isBusinessUser(authUser?.role) &&
    !!authUser?.id &&
    (userLoading || authLoading) &&
    !activeBusinessId

  if (resolvingBusinessSession || waitingForBusinessProfile) {
    return <SplashScreen message="Cargando tu negocio…" />
  }

  if (resolvedBusiness) {
    if (!resolvedBusinessId) return <MyBusinessEmptyScreen />
    return <BusinessHomeScreen placeId={resolvedBusinessId} />
  }

  return <InicioScreen />
}

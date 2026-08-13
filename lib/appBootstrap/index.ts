export type { BootstrapPhase, BootstrapState, UserRole } from './types'
export {
  roleFromProfile,
  isOnboardingCompleteFromProfile,
  syncProfileStoreFromAuth,
} from './syncProfile'
export { roleFromAccountType, normalizeUserRole, isBusinessUser } from '@/lib/domain/user'
export {
  resolveAppDestination,
  resolvePostAuthDestination,
  destinationMatchesPath,
  normalizePath,
  isPublicPath,
  isAuthFormPath,
  isOnboardingPath,
  isPublicBrowsePath,
  isLegalPath,
} from './resolveDestination'
export { clearLocalSessionArtifacts } from './clearLocalSession'
export {
  completeTouristOnboarding,
  completeBusinessOnboarding,
} from './completeOnboarding'
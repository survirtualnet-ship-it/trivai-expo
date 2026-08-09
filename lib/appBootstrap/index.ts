export type { BootstrapPhase, BootstrapState, UserRole } from './types'
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
export {
  syncProfileStoreFromAuth,
  roleFromProfile,
  isOnboardingCompleteFromProfile,
} from './syncProfile'
export { clearLocalSessionArtifacts } from './clearLocalSession'
export {
  completeTouristOnboarding,
  completeBusinessOnboarding,
} from './completeOnboarding'

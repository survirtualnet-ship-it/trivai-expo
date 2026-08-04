export type { BootstrapPhase, BootstrapState, UserRole } from './types'
export {
  resolveAppDestination,
  resolvePostAuthDestination,
  destinationMatchesPath,
  isPublicPath,
  isAuthFormPath,
  isOnboardingPath,
} from './resolveDestination'
export {
  syncProfileStoreFromAuth,
  roleFromProfile,
  isOnboardingCompleteFromProfile,
} from './syncProfile'
export {
  completeTouristOnboarding,
  completeBusinessOnboarding,
} from './completeOnboarding'

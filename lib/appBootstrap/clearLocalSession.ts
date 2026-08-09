import { useProfileStore } from '@/src/profile/store/useProfileStore'
import { useOnboardingStore } from '@/onboarding/store/onboardingStore'
import { useAppModeStore } from '@/src/appMode'
import { useCompanyProfileStore } from '@/src/company/store/useCompanyProfileStore'
import { clearOnboardingFlags } from '@/lib/onboardingStorage'
import { MOCK_USER } from '@/src/profile/data/mockProfile'

/**
 * Wipe persisted local identity so the next login cannot inherit
 * company role / companyId / onboarding flags from a previous account.
 */
export function clearLocalSessionArtifacts(): void {
  useProfileStore.setState({
    user: {
      ...MOCK_USER,
      id: '',
      name: '',
      email: undefined,
      avatarUrl: '',
      photo: undefined,
      initials: '',
      city: '',
      role: 'tourist',
      companyId: undefined,
      onboardingCompleted: false,
      locationPermission: undefined,
    },
  })

  useOnboardingStore.getState().resetOnboarding()
  useAppModeStore.getState().setMode('explore')

  useCompanyProfileStore.setState({
    activeCompanyId: null,
    company: null,
    products: [],
    reviews: [],
    stats: null,
    gallery: [],
    editMode: false,
    isCompanyOwner: false,
    activeTab: 'home',
    draftCompany: null,
    loadingRemote: false,
    loadError: null,
  })

  void clearOnboardingFlags()
}

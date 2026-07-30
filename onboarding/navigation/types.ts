export type OnboardingStackParamList = {
  Welcome: undefined
  UserType: undefined
  TouristInterests: undefined
  TouristLocation: undefined
  TouristSocial: undefined
  TouristDone: undefined
  BusinessGoogleLogin: undefined
  BusinessSearch: undefined
  BusinessVerify: undefined
  BusinessSetup: undefined
  BusinessDone: undefined
}

export type OnboardingRouteName = keyof OnboardingStackParamList

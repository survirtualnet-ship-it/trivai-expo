import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onboardingTheme as t } from '../lib/theme'
import type { OnboardingStackParamList, OnboardingRouteName } from './types'

import { WelcomeScreen } from '../screens/WelcomeScreen'
import { UserTypeScreen } from '../screens/UserTypeScreen'
import { InterestsScreen } from '../screens/tourist/InterestsScreen'
import { LocationScreen } from '../screens/tourist/LocationScreen'
import { SocialConnectScreen } from '../screens/tourist/SocialConnectScreen'
import { TouristDoneScreen } from '../screens/tourist/DoneScreen'
import { GoogleLoginScreen } from '../screens/business/GoogleLoginScreen'
import { BusinessSearchScreen } from '../screens/business/BusinessSearchScreen'
import { BusinessVerifyScreen } from '../screens/business/BusinessVerifyScreen'
import { BusinessSetupScreen } from '../screens/business/BusinessSetupScreen'
import { BusinessDoneScreen } from '../screens/business/DoneScreen'

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

const screenOptions = {
  headerShown: false as const,
  contentStyle: { backgroundColor: t.bg },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
}

export function OnboardingNavigator({
  initialRouteName = 'Welcome',
}: {
  initialRouteName?: OnboardingRouteName
}) {
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UserType" component={UserTypeScreen} />

      <Stack.Screen name="TouristInterests" component={InterestsScreen} />
      <Stack.Screen name="TouristLocation" component={LocationScreen} />
      <Stack.Screen name="TouristSocial" component={SocialConnectScreen} />
      <Stack.Screen name="TouristDone" component={TouristDoneScreen} />

      <Stack.Screen name="BusinessGoogleLogin" component={GoogleLoginScreen} />
      <Stack.Screen name="BusinessSearch" component={BusinessSearchScreen} />
      <Stack.Screen name="BusinessVerify" component={BusinessVerifyScreen} />
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      <Stack.Screen name="BusinessDone" component={BusinessDoneScreen} />
    </Stack.Navigator>
  )
}

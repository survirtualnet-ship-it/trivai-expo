import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { OnboardingNavigator } from './navigation/OnboardingNavigator'
import { onboardingTheme as t } from './lib/theme'

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: t.bg,
    card: t.surface,
    text: t.text,
    border: t.border,
    primary: t.accent,
  },
}

/** Business-only onboarding — skips Welcome/UserType tourist flow */
export function BusinessOnboardingRoot() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme} independent>
          <StatusBar style="dark" />
          <OnboardingNavigator initialRouteName="BusinessGoogleLogin" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
})

import { Stack, usePathname } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { T } from '@/lib/tokens'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ConfigMissingScreen } from '@/components/ConfigMissingScreen'
import { QueryProvider } from '@/components/QueryProvider'
import { WebAppShell } from '@/components/WebAppShell'
import { AuthGuard } from '@/components/AuthGuard'
import { AuthProvider } from '@/components/AuthProvider'
import { SplashScreen } from '@/components/SplashScreen'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useAuthStore } from '@/src/auth/store/useAuthStore'
import { AppModeProvider } from '@/src/appMode'

function AppShell() {
  const pathname = usePathname()
  const bootstrap = useAppBootstrap()
  const authLoading = useAuthStore(s => s.isLoading)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  // OAuth return must mount /auth/callback — never cover auth routes with splash
  const isAuthRoute = (pathname ?? '').startsWith('/auth')
  // Keep splash until bootstrap resolves role/destination — avoids flashing
  // tourist onboarding or explore UI for returning business users.
  const showSplash =
    !isAuthRoute &&
    (authLoading || !bootstrap.ready)

  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }} />
      {showSplash ? (
        <View style={styles.splashOverlay}>
          <SplashScreen />
        </View>
      ) : null}
    </>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  return (
    <QueryProvider>
      {!isSupabaseConfigured ? (
        <SafeAreaProvider>
          <WebAppShell>
            <StatusBar style="dark" backgroundColor={T.surface} />
            <ConfigMissingScreen />
          </WebAppShell>
        </SafeAreaProvider>
      ) : !fontsLoaded ? (
        <WebAppShell>
          <View style={styles.loader}>
            <ActivityIndicator color={T.primary} size="large" />
          </View>
        </WebAppShell>
      ) : (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <WebAppShell>
              <StatusBar style="dark" backgroundColor={T.surface} />
              <AuthProvider>
                <AppModeProvider>
                  <AppShell />
                </AppModeProvider>
              </AuthProvider>
            </WebAppShell>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      )}
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
})

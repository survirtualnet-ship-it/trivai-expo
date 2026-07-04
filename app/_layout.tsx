import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { T } from '@/lib/tokens'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ConfigMissingScreen } from '@/components/ConfigMissingScreen'

export default function RootLayout() {
  if (!isSupabaseConfigured) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={T.surface} />
        <ConfigMissingScreen />
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={T.surface} />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}

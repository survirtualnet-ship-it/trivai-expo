import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { T } from '@/lib/tokens'
import { isSupabaseConfigured } from '@/lib/supabase'
import { ConfigMissingScreen } from '@/components/ConfigMissingScreen'
import { QueryProvider } from '@/components/QueryProvider'
import { WebAppShell } from '@/components/WebAppShell'

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
        <SafeAreaProvider>
          <WebAppShell>
            <StatusBar style="dark" backgroundColor={T.surface} />
            <Stack screenOptions={{ headerShown: false }} />
          </WebAppShell>
        </SafeAreaProvider>
      )}
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
})

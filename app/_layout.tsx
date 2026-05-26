import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { T } from '@/lib/tokens'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={T.surface}/>
      <Stack screenOptions={{ headerShown: false }}/>
    </SafeAreaProvider>
  )
}

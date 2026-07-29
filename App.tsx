import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, fontSize, fontWeight } from './src/theme'

/**
 * Placeholder entry. Production runs via `expo-router/entry`
 * (`app/(tabs)` → `src/screens`). Do not mount a second
 * NavigationContainer here — it conflicts with Expo Router.
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trivai</Text>
      <Text style={styles.body}>
        Start the app with Expo Router (`npx expo start`). Screens live in
        src/screens and tabs in app/(tabs).
      </Text>
      <StatusBar style="dark" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})

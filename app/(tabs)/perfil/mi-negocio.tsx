import { useEffect } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { T } from '@/lib/tokens'

/** Legacy route — business onboarding moved to /empresa/onboarding. */
export default function MiNegocioLegacyRedirect() {
  useEffect(() => {
    router.replace('/empresa/onboarding')
  }, [])

  return (
    <View style={styles.root}>
      <ActivityIndicator color={T.primary} size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.bg,
  },
})

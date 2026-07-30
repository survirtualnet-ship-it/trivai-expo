import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { T, F, S } from '@/lib/tokens'

type Props = {
  message?: string
}

/** Branded splash shown while session + stores hydrate. */
export function SplashScreen({ message = 'Cargando Trivai…' }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#6D28FF', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Text style={styles.letter}>T</Text>
      </LinearGradient>
      <Text style={styles.brand}>Trivai</Text>
      <ActivityIndicator color={T.primary} size="large" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.bg,
    gap: S.md,
    padding: S.xxl,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
  },
  brand: {
    fontSize: F.size.hero,
    fontWeight: F.weight.bold,
    color: T.fg1,
    letterSpacing: -0.5,
  },
  spinner: {
    marginTop: S.lg,
  },
  message: {
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: S.sm,
  },
})

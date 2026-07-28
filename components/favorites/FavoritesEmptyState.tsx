import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Heart } from 'lucide-react-native'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { T, F, S } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  isAuthenticated?: boolean
}

export const FavoritesEmptyState = memo(function FavoritesEmptyState({
  isAuthenticated = true,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Heart size={28} color={T.fg3} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>Guarda lugares para verlos aquí</Text>
      <Text style={styles.sub}>
        {isAuthenticated
          ? 'Toca el corazón en cualquier lugar y arma tu lista.'
          : 'Inicia sesión para guardar y sincronizar tus favoritos.'}
      </Text>
      <Button
        label={isAuthenticated ? 'Explorar' : 'Iniciar sesión'}
        variant="primary"
        size="lg"
        onPress={() => router.push(isAuthenticated ? '/lugares' : '/auth')}
        style={styles.btn}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.xxxl,
    gap: S.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xxl,
    fontWeight: F.weight.semibold,
    color: T.fg1,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: S.lg,
    minWidth: 180,
    borderRadius: 999,
  },
})

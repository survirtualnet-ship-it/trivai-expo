import { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Heart } from 'lucide-react-native'
import { router } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { T, F, S, R } from '@/lib/tokens'
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
        <Heart size={32} color={T.primary} />
      </View>
      <Text style={styles.title}>Guarda lugares para verlos aquí</Text>
      <Text style={styles.sub}>
        {isAuthenticated
          ? 'Toca el corazón en cualquier lugar para armar tu colección.'
          : 'Inicia sesión para guardar y sincronizar tus favoritos.'}
      </Text>
      <Button
        label={isAuthenticated ? 'Explorar lugares' : 'Iniciar sesión'}
        variant="primary"
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
    paddingHorizontal: S.xxl,
    paddingVertical: S.xxxl,
    gap: S.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.xl,
    fontWeight: F.weight.bold,
    color: T.fg1,
    textAlign: 'center',
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    marginTop: S.md,
    minWidth: 200,
  },
})

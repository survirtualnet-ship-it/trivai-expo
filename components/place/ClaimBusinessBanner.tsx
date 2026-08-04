import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Building2 } from 'lucide-react-native'
import { router } from 'expo-router'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  placeName: string
  claimed: boolean
  isOwner: boolean
  isAuthenticated: boolean
}

export const ClaimBusinessBanner = memo(function ClaimBusinessBanner({
  placeName,
  claimed,
  isOwner,
  isAuthenticated,
}: Props) {
  if (claimed || isOwner) return null

  const handlePress = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    router.push('/empresa/onboarding')
  }

  return (
    <View style={styles.wrap}>
      <Building2 size={20} color={T.primary} />
      <View style={styles.body}>
        <Text style={styles.title}>¿Eres dueño de {placeName}?</Text>
        <Text style={styles.sub}>
          Reclama tu negocio gratis y activa tu panel con contenido en vivo.
        </Text>
        <Pressable
          style={styles.btn}
          onPress={handlePress}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>
            {isAuthenticated ? 'Reclamar negocio' : 'Inicia sesión para reclamar'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: S.md,
    marginHorizontal: S.lg,
    marginTop: S.lg,
    padding: S.lg,
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
  },
  body: { flex: 1, gap: S.sm },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: T.fg1,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    lineHeight: 18,
  },
  btn: {
    alignSelf: 'flex-start',
    marginTop: S.xs,
    backgroundColor: T.primary,
    paddingHorizontal: S.lg,
    paddingVertical: S.sm,
    borderRadius: R.full,
  },
  btnText: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.surface,
  },
})

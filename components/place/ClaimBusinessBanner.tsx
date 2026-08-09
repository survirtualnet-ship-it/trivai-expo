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
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Building2 size={22} color={T.surface} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Sin gestión en Trivai</Text>
          <Text style={styles.title}>
            Este negocio aún no está gestionado en Trivai
          </Text>
        </View>
      </View>

      <Text style={styles.sub}>
        {placeName} ya aparece por Google Maps. Si es tuyo, reclámalo para
        responder reseñas y dar vida al perfil.
      </Text>

      <Pressable
        style={styles.btn}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Reclamar negocio"
      >
        <Text style={styles.btnText}>
          {isAuthenticated ? 'Reclamar negocio' : 'Inicia sesión y reclama'}
        </Text>
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: S.lg,
    marginTop: S.lg,
    padding: S.lg,
    backgroundColor: T.purpleSoft,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.primary,
    gap: S.md,
  },
  header: {
    flexDirection: 'row',
    gap: S.md,
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: FONT.semibold,
    fontSize: F.size.xs,
    color: T.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg2,
    lineHeight: 20,
  },
  btn: {
    marginTop: S.xs,
    backgroundColor: T.primary,
    paddingVertical: 14,
    borderRadius: R.full,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    color: T.surface,
  },
})

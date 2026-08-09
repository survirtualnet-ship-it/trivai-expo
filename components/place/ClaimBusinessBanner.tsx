import { memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Building2, CheckCircle2, Sparkles, BarChart3 } from 'lucide-react-native'
import { router } from 'expo-router'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

type Props = {
  placeName: string
  claimed: boolean
  isOwner: boolean
  isAuthenticated: boolean
}

const BENEFITS = [
  { icon: Sparkles, text: 'Perfil vivo con tips y horarios' },
  { icon: BarChart3, text: 'Panel con visitas y reseñas' },
  { icon: CheckCircle2, text: 'Gratis · sin aprobación manual' },
]

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
          <Text style={styles.eyebrow}>¿Es tu negocio?</Text>
          <Text style={styles.title}>Reclama {placeName}</Text>
        </View>
      </View>

      <Text style={styles.sub}>
        Activa tu panel en Trivai y diferencia tu local con contenido en tiempo
        real aportado por la comunidad.
      </Text>

      <View style={styles.benefits}>
        {BENEFITS.map(b => (
          <View key={b.text} style={styles.benefitRow}>
            <b.icon size={16} color={T.primary} />
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}
      </View>

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
  benefits: { gap: S.sm },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  benefitText: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg1,
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

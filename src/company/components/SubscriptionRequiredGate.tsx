import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Sparkles } from 'lucide-react-native'
import { companyTheme as t } from '../theme'

type Props = {
  placeId: string
  businessName?: string
}

export function SubscriptionRequiredGate({ placeId, businessName }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Sparkles size={28} color={t.accent} />
      </View>
      <Text style={styles.title}>Debes elegir un plan para comenzar.</Text>
      <Text style={styles.subtitle}>
        Tu negocio ya está reclamado. Selecciona Free, Pro o Premium para activar las herramientas de Trivai.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        onPress={() =>
          router.push({
            pathname: '/empresa/plan',
            params: { placeId, name: businessName ?? '' },
          } as never)
        }
      >
        <Text style={styles.btnLabel}>Elegir plan</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing.xxl,
    gap: t.spacing.md,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: t.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.sm,
  },
  title: {
    color: t.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: t.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  btn: {
    marginTop: t.spacing.md,
    backgroundColor: t.accent,
    paddingHorizontal: t.spacing.xxl,
    paddingVertical: 14,
    borderRadius: t.radius.full,
  },
  btnLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: { opacity: 0.92 },
})

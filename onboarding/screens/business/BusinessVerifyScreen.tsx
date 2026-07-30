import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { OnboardingLayout } from '../../components/OnboardingLayout'
import { PrimaryButton } from '../../components/PrimaryButton'
import { useOnboardingStore } from '../../store/onboardingStore'
import { verifyBusinessEmail } from '../../lib/googleAuth'
import { onboardingTheme as t } from '../../lib/theme'
import type { BusinessVerifyProps } from '../types'

export function BusinessVerifyScreen({ navigation }: BusinessVerifyProps) {
  const googleUser = useOnboardingStore(s => s.googleUser)
  const businessData = useOnboardingStore(s => s.businessData)
  const updateBusinessData = useOnboardingStore(s => s.updateBusinessData)

  const status = useMemo(() => {
    if (!googleUser?.email) return 'pending' as const
    return verifyBusinessEmail(googleUser.email, businessData?.website)
  }, [googleUser?.email, businessData?.website])

  const handleContinue = () => {
    if (businessData) {
      updateBusinessData({ verificationStatus: status })
    }
    navigation.navigate('BusinessSetup')
  }

  if (!businessData) {
    return (
      <OnboardingLayout title="Sin negocio seleccionado">
        <PrimaryButton
          label="Volver a buscar"
          onPress={() => navigation.navigate('BusinessSearch')}
        />
      </OnboardingLayout>
    )
  }

  const approved = status === 'approved'

  return (
    <OnboardingLayout
      title="Verificación"
      subtitle="Confirmamos que este negocio te pertenece."
      footer={
        <PrimaryButton
          label={approved ? 'Continuar' : 'Continuar (pendiente)'}
          onPress={handleContinue}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.name}>{businessData.name}</Text>
        <Text style={styles.address}>{businessData.address}</Text>
        <Text style={styles.meta}>Place ID: {businessData.placeId}</Text>
      </View>

      <View style={[styles.status, approved ? styles.statusOk : styles.statusPending]}>
        <Ionicons
          name={approved ? 'shield-checkmark' : 'time'}
          size={22}
          color={approved ? t.success : t.warning}
        />
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>
            {approved ? 'Verificación automática aprobada' : 'Verificación pendiente'}
          </Text>
          <Text style={styles.statusSub}>
            {approved
              ? 'Tu correo coincide con el dominio del negocio.'
              : 'Revisaremos tu solicitud en 24–48 h. Puedes continuar configurando tu perfil.'}
          </Text>
        </View>
      </View>

      {googleUser ? (
        <Text style={styles.account}>Cuenta: {googleUser.email}</Text>
      ) : null}
    </OnboardingLayout>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing.lg,
    gap: t.spacing.sm,
    marginBottom: t.spacing.lg,
  },
  name: {
    color: t.text,
    fontSize: t.font.subtitle,
    fontWeight: '800',
  },
  address: {
    color: t.textSecondary,
    fontSize: t.font.body,
    lineHeight: 22,
  },
  meta: {
    color: t.textMuted,
    fontSize: t.font.caption,
    marginTop: t.spacing.xs,
  },
  status: {
    flexDirection: 'row',
    gap: t.spacing.md,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: 1,
  },
  statusOk: {
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderColor: 'rgba(52,211,153,0.35)',
  },
  statusPending: {
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderColor: 'rgba(251,191,36,0.35)',
  },
  statusText: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    color: t.text,
    fontSize: t.font.body,
    fontWeight: '700',
  },
  statusSub: {
    color: t.textSecondary,
    fontSize: t.font.caption,
    lineHeight: 18,
  },
  account: {
    color: t.textMuted,
    fontSize: t.font.caption,
    marginTop: t.spacing.lg,
  },
})

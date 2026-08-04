import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthBranding } from '@/components/auth/AuthBranding'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { LegalConsentCheckbox } from '@/components/legal/LegalConsentCheckbox'
import { PrimaryButton } from '@/onboarding/components/PrimaryButton'
import { onboardingTheme as t } from '@/onboarding/lib/theme'
import { useUser } from '@/hooks/useUser'
import { acceptLegalTerms, LEGAL_VERSION } from '@/lib/legal'
import { navigateAfterAuth } from '@/lib/navigateAfterAuth'
import { ensureProfile } from '@/lib/auth/ensureProfile'

/**
 * Forced when legal_version !== LEGAL_VERSION (or never accepted).
 */
export default function LegalAcceptScreen() {
  const { user, refreshProfile } = useUser()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    if (!accepted) {
      setError('Debes aceptar los Términos y la Política de Privacidad')
      return
    }
    if (!user?.id) {
      setError('Sesión no válida. Vuelve a iniciar sesión.')
      return
    }

    setLoading(true)
    setError('')
    const result = await acceptLegalTerms(user.id)
    if (!result.ok) {
      setError(result.error ?? 'No se pudo guardar la aceptación')
      setLoading(false)
      return
    }

    await refreshProfile?.()
    const profile = await ensureProfile(user)
    setLoading(false)
    await navigateAfterAuth(user, profile)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <AuthBranding
          title="Actualización legal"
          subtitle={`Para continuar, acepta la versión ${LEGAL_VERSION} de nuestros Términos y Política de Privacidad.`}
        />

        <AuthCard>
          <AuthErrorBanner message={error} />
          <Text style={styles.body}>
            Cuando actualizamos nuestras políticas, pedimos tu consentimiento
            de nuevo. Es rápido y protege a toda la comunidad.
          </Text>
          <LegalConsentCheckbox checked={accepted} onChange={setAccepted} />
          <PrimaryButton
            label="Continuar"
            loading={loading}
            disabled={!accepted}
            onPress={handleAccept}
          />
        </AuthCard>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: t.spacing.xl,
    gap: t.spacing.xl,
  },
  body: {
    color: t.textSecondary,
    fontSize: t.font.body,
    lineHeight: 22,
    marginBottom: t.spacing.md,
  },
})

import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Lock } from 'lucide-react-native'
import { goAuthBack } from '@/lib/auth/goAuthBack'
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { AuthInput } from '@/components/auth/AuthInput'
import { AuthBranding } from '@/components/auth/AuthBranding'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { PrimaryButton } from '@/onboarding/components/PrimaryButton'
import { onboardingTheme as t } from '@/onboarding/lib/theme'
import { supabase } from '@/lib/supabase'
import { mapAuthError } from '@/lib/auth/authErrors'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = password.length >= 6 && password === confirm

  const handleSave = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (err) {
      setError(mapAuthError(err, 'No se pudo actualizar la contraseña.'))
      return
    }

    Alert.alert('Listo', 'Tu contraseña fue actualizada.', [
      { text: 'Continuar', onPress: () => router.replace('/') },
    ])
  }

  return (
    <AuthScreenLayout centered onBack={() => goAuthBack('/auth/login')}>
      <AuthBranding
        title="Nueva contraseña"
        subtitle="Elige una contraseña segura para tu cuenta"
      />

      <AuthCard>
        <AuthErrorBanner message={error} />

        <View style={styles.form}>
          <AuthInput
            label="Nueva contraseña"
            icon={Lock}
            password
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <AuthInput
            label="Confirmar contraseña"
            icon={Lock}
            password
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite la contraseña"
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <PrimaryButton
            label="Guardar contraseña"
            onPress={handleSave}
            loading={loading}
            disabled={!isValid}
          />
        </View>
      </AuthCard>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: t.spacing.lg,
  },
})

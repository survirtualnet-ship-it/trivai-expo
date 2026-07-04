import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { supabase } from '@/lib/supabase'
import { mapAuthError } from '@/lib/auth/authErrors'
import { T, F, S, R } from '@/lib/tokens'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Nueva contraseña" fallbackHref="/auth/login" />

      <View style={styles.body}>
        <Text style={styles.lead}>Elige una contraseña segura para tu cuenta.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={T.fg4}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={8}>
              {showPass ? <EyeOff size={20} color={T.fg3} /> : <Eye size={20} color={T.fg3} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={[styles.input, styles.inputPlain]}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPass}
            placeholder="Repite la contraseña"
            placeholderTextColor={T.fg4}
            autoCapitalize="none"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Guardar contraseña</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: T.bg },
  body:  { padding: S.lg, gap: S.lg },
  lead:  { fontSize: F.size.md, color: T.fg2, lineHeight: 20 },
  field: { gap: S.sm },
  label: { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: S.md,
  },
  input: {
    flex: 1,
    fontSize: F.size.md,
    color: T.fg1,
    paddingVertical: S.md,
  },
  inputPlain: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: S.md,
    paddingVertical: S.md,
    fontSize: F.size.md,
    color: T.fg1,
  },
  error: { fontSize: F.size.sm, color: T.danger },
  btn: {
    backgroundColor: T.purple,
    borderRadius: R.full,
    paddingVertical: S.lg,
    alignItems: 'center',
    marginTop: S.sm,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: F.size.md, fontWeight: F.weight.bold },
})

import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle } from '@/lib/auth/googleOAuth'
import { mapAuthError } from '@/lib/auth/authErrors'
import { T, F, S, R } from '@/lib/tokens'

export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(mapAuthError(err, 'No se pudo iniciar sesión.'))
      setLoading(false)
      return
    }

    router.replace('/')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      router.replace('/')
    } catch (err) {
      setError(mapAuthError(err, 'Error al iniciar sesión con Google.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={22} color={T.fg1} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>trivai</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido de vuelta</Text>
          <Text style={styles.sub}>Inicia sesión para continuar explorando</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* EMAIL */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={T.fg4}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                placeholderTextColor={T.fg4}
                secureTextEntry={!showPass}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                {showPass
                  ? <EyeOff size={20} color={T.fg3} />
                  : <Eye size={20} color={T.fg3} />
                }
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop: S.sm, alignSelf: 'flex-end' }}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Iniciar sesión</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.btnGoogle, googleLoading && styles.btnDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading
              ? <ActivityIndicator color={T.purple} />
              : <Text style={styles.btnGoogleText}>Continuar con Google</Text>
            }
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/registro')}>
              <Text style={styles.registerLink}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  scroll:       { flexGrow: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerLogo:   { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.purple },
  content:      { padding: S.xl },
  title:        { fontSize: 26, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  sub:          { fontSize: F.size.base, color: T.fg3, marginBottom: S.xl },
  errorBox:     { backgroundColor: T.orangeSoft, borderWidth: 1, borderColor: T.orange, borderRadius: R.md, padding: S.md, marginBottom: S.lg },
  errorText:    { fontSize: F.size.sm, color: T.orangeInk, fontWeight: F.weight.medium },
  field:        { marginBottom: S.lg },
  label:        { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1, marginBottom: S.sm },
  input:        { height: 52, borderRadius: R.md, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.surface, paddingHorizontal: S.lg, fontSize: F.size.md, color: T.fg1, marginBottom: 0 },
  passRow:      { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  eyeBtn:       { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  forgot:       { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  btnPrimary:   { height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6, marginBottom: S.lg },
  btnDisabled:  { backgroundColor: T.fg4, shadowOpacity: 0, elevation: 0 },
  btnText:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.lg },
  dividerLine:  { flex: 1, height: 1, backgroundColor: T.border },
  dividerLabel: { fontSize: F.size.sm, color: T.fg4 },
  btnGoogle:    { height: 52, borderRadius: R.lg, backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.border2, alignItems: 'center', justifyContent: 'center', marginBottom: S.lg },
  btnGoogleText:{ fontSize: F.size.base, fontWeight: F.weight.semibold, color: T.fg1 },
  registerRow:  { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: F.size.base, color: T.fg3 },
  registerLink: { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.bold },
  orangeInk:    T.orange,
})

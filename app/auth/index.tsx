import { useState } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { router } from 'expo-router'
import { signInWithGoogle } from '@/lib/auth/googleOAuth'
import { mapAuthError } from '@/lib/auth/authErrors'
import { T, F, S, R } from '@/lib/tokens'

export default function Bienvenida() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      if (Platform.OS !== 'web') router.replace('/')
    } catch (err) {
      setError(mapAuthError(err, 'Error al iniciar sesión con Google.'))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <View style={styles.root}>

      {/* LOGO */}
      <View style={styles.logoArea}>
        <Image
          source={require('../../assets/logo-trivai.png')}
          style={styles.logoImg}
          resizeMode="contain"
          accessibilityLabel="Trivai"
        />
        <Text style={styles.logoSub}>Bolivia en la palma de tu mano</Text>
      </View>

      {/* TEXTO */}
      <View style={styles.textArea}>
        <Text style={styles.headline}>Descubre. Conecta.{'\n'}Disfruta.</Text>
        <Text style={styles.sub}>
          Lugares increíbles, eventos y amigos cerca de ti en Santa Cruz de la Sierra.
        </Text>
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* BOTONES */}
      <View style={styles.btns}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btnGoogle, googleLoading && styles.btnDisabled]}
          onPress={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading
            ? <ActivityIndicator color={T.purple} />
            : <Text style={styles.btnGoogleText}>Continuar con Google</Text>
          }
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/auth/registro')}>
          <Text style={styles.btnPrimaryText}>Crear cuenta con email</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnSecondaryText}>Iniciar sesión con email</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          Al continuar aceptas nuestros{' '}
          <Text style={styles.termsLink}>Términos de uso</Text>
          {' '}y{' '}
          <Text style={styles.termsLink}>Privacidad</Text>
        </Text>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#fff', paddingHorizontal: S.xl, paddingTop: 80, paddingBottom: 48, justifyContent: 'space-between' },
  logoArea:        { alignItems: 'center', gap: S.sm },
  logoImg:         { height: 64, width: 220 },
  logoSub:         { fontSize: F.size.base, color: T.fg3, fontWeight: F.weight.medium },
  textArea:        { alignItems: 'center' },
  headline:        { fontSize: 28, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center', lineHeight: 36, marginBottom: S.md },
  sub:             { fontSize: F.size.md, color: T.fg3, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  dots:            { flexDirection: 'row', gap: S.sm, marginTop: S.xl },
  dot:             { width: 8, height: 8, borderRadius: R.full, backgroundColor: T.fg4 },
  dotActive:       { width: 24, backgroundColor: T.purple },
  btns:            { gap: S.md },
  errorBox:        { backgroundColor: T.orangeSoft, borderWidth: 1, borderColor: T.orange, borderRadius: R.md, padding: S.md },
  errorText:       { fontSize: F.size.sm, color: T.orange, fontWeight: F.weight.medium },
  btnGoogle:       { height: 52, borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 1.5, borderColor: T.border2, alignItems: 'center', justifyContent: 'center' },
  btnGoogleText:   { fontSize: F.size.base, fontWeight: F.weight.semibold, color: T.fg1 },
  btnPrimary:      { height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  btnDisabled:     { opacity: 0.65 },
  btnPrimaryText:  { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  divider:         { flexDirection: 'row', alignItems: 'center', gap: S.md },
  dividerLine:     { flex: 1, height: 1, backgroundColor: T.border },
  dividerText:     { fontSize: F.size.sm, color: T.fg4 },
  btnSecondary:    { height: 52, borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 2, borderColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText:{ fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.purple },
  terms:           { fontSize: F.size.sm, color: T.fg3, textAlign: 'center', marginTop: S.sm },
  termsLink:       { color: T.purple, fontWeight: F.weight.semibold },
})

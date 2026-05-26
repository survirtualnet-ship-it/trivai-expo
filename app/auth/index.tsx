import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { T, F, S, R } from '@/lib/tokens'

export default function Bienvenida() {
  return (
    <View style={styles.root}>

      {/* LOGO */}
      <View style={styles.logoArea}>
        <Text style={styles.logoText}>trivai</Text>
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
  logoText:        { fontSize: 52, fontWeight: F.weight.bold, color: T.purple, letterSpacing: -2 },
  logoSub:         { fontSize: F.size.base, color: T.fg3, fontWeight: F.weight.medium },
  textArea:        { alignItems: 'center' },
  headline:        { fontSize: 28, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center', lineHeight: 36, marginBottom: S.md },
  sub:             { fontSize: F.size.md, color: T.fg3, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  dots:            { flexDirection: 'row', gap: S.sm, marginTop: S.xl },
  dot:             { width: 8, height: 8, borderRadius: R.full, backgroundColor: T.fg4 },
  dotActive:       { width: 24, backgroundColor: T.purple },
  btns:            { gap: S.md },
  btnPrimary:      { height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  btnPrimaryText:  { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  divider:         { flexDirection: 'row', alignItems: 'center', gap: S.md },
  dividerLine:     { flex: 1, height: 1, backgroundColor: T.border },
  dividerText:     { fontSize: F.size.sm, color: T.fg4 },
  btnSecondary:    { height: 52, borderRadius: R.lg, backgroundColor: '#fff', borderWidth: 2, borderColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText:{ fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.purple },
  terms:           { fontSize: F.size.sm, color: T.fg3, textAlign: 'center', marginTop: S.sm },
  termsLink:       { color: T.purple, fontWeight: F.weight.semibold },
})

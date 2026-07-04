import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { T, F, S, R } from '@/lib/tokens'

const VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_GOOGLE_MAPS_KEY',
] as const

export function ConfigMissingScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.title}>Configuración incompleta</Text>
        <Text style={styles.lead}>
          La app no puede conectar con Supabase porque faltan variables de entorno en el build de Vercel.
        </Text>
        <Text style={styles.section}>En Vercel → Project → Settings → Environment Variables, agrega:</Text>
        {VARS.map(v => (
          <Text key={v} style={styles.var}>{v}</Text>
        ))}
        <Text style={styles.section}>
          Usa los mismos valores que en tu `.env.local`. Luego ve a Deployments → Redeploy (sin caché).
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  body: { padding: S.xl, gap: S.md },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: S.sm },
  title: { fontSize: F.size.h1, fontWeight: '700', color: T.fg1, textAlign: 'center' },
  lead: { fontSize: F.size.md, color: T.fg2, lineHeight: 22, textAlign: 'center' },
  section: { fontSize: F.size.sm, color: T.fg2, lineHeight: 20, marginTop: S.sm },
  var: {
    fontSize: F.size.sm,
    fontFamily: 'monospace',
    color: T.purple,
    backgroundColor: T.purpleSoft,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderRadius: R.md,
    overflow: 'hidden',
  },
})

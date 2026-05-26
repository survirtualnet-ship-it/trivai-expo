import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { T, F, S } from '@/lib/tokens'

export default function Inicio() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.logo}>trivai</Text>
        <Text style={styles.fecha}>
          {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.placeholder}>Pantalla Inicio — en construcción</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  topbar:      { backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  logo:        { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.purple },
  fecha:       { fontSize: F.size.sm, color: T.fg3, marginTop: 2, textTransform: 'capitalize' },
  content:     { padding: S.lg },
  placeholder: { color: T.fg3, textAlign: 'center', marginTop: 40 },
})

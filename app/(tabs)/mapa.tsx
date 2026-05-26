import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { T, F, S } from '@/lib/tokens'

export default function Mapa() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Mapa</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.placeholder}>Mapa — instalar react-native-maps</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  topbar:      { backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:       { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: T.fg3 },
})

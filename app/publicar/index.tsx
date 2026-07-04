import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MapPin, Ticket, Star, Map, Camera, ChevronRight } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'

export default function Publicar() {
  const { isBusiness } = useUser()

  const opciones = [
    ...(isBusiness ? [{
      Icon: MapPin, titulo: 'Agregar mi negocio',
      desc: 'Registra tu negocio con los datos de Google',
      tone: { bg: T.purpleSoft, fg: T.purple },
      onPress: () => router.push('/perfil/mi-negocio'),
    }] : []),
    {
      Icon: Ticket, titulo: 'Publicar un evento',
      desc: 'Comparte un concierto, feria, exposición...',
      tone: { bg: T.orangeSoft, fg: T.orange },
      onPress: () => router.push('/publicar/evento'),
    },
    {
      Icon: MapPin, titulo: 'Sugerir un lugar',
      desc: 'Agrega un restaurante, café, parque u otro sitio',
      tone: { bg: T.greenSoft, fg: T.green },
      onPress: () => router.push('/publicar/lugar'),
    },
    {
      Icon: Star, titulo: 'Escribir una reseña',
      desc: 'Comparte tu experiencia en un lugar',
      tone: { bg: T.greenSoft, fg: T.green },
      onPress: () => router.push('/lugares'),
    },
    {
      Icon: Map, titulo: 'Ver el mapa',
      desc: 'Explora lugares y eventos cerca de ti',
      tone: { bg: T.purpleSoft, fg: T.purple },
      onPress: () => router.push('/mapa'),
    },
    {
      Icon: Camera, titulo: 'Editar mi perfil',
      desc: 'Actualiza tu foto y datos de perfil',
      tone: { bg: T.orangeSoft, fg: T.orange },
      onPress: () => router.push('/perfil/editar'),
    },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <ScreenHeader title="Crear" fallbackHref="/" />

      <ScrollView contentContainerStyle={{ padding: S.lg }}>
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </View>
          <Text style={styles.heroTitle}>¿Qué quieres hacer?</Text>
          <Text style={styles.heroSub}>Contribuye y ayuda a la comunidad Trivai</Text>
        </View>

        {/* OPCIONES */}
        <View style={styles.opcionesWrap}>
          {opciones.map((op, idx) => (
            <TouchableOpacity key={op.titulo} style={styles.opcionCard} onPress={op.onPress}>
              <View style={[styles.opcionIcon, { backgroundColor: op.tone.bg }]}>
                <op.Icon size={22} color={op.tone.fg} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.opcionTitulo}>{op.titulo}</Text>
                <Text style={styles.opcionDesc}>{op.desc}</Text>
              </View>
              <ChevronRight size={18} color={T.fg4} strokeWidth={1.5} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  hero:        { alignItems: 'center', paddingVertical: S.xl },
  heroIcon:    { width: 72, height: 72, borderRadius: 22, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', marginBottom: S.md, shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  heroTitle:   { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  heroSub:     { fontSize: F.size.md, color: T.fg2, textAlign: 'center' },
  opcionesWrap:{ gap: S.sm },
  opcionCard:  { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: T.border },
  opcionIcon:  { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  opcionTitulo:{ fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  opcionDesc:  { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
})

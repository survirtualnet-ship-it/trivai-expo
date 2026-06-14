import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Star } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'

type Resena = {
  id: string
  lugar: string
  rating: number
  fecha: string
  texto: string
  emoji: string
  href: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} color={i <= rating ? T.orange : T.border} fill={i <= rating ? T.orange : 'transparent'} strokeWidth={1.5} />
      ))}
    </View>
  )
}

export default function MisResenas() {
  const [resenas, setResenas] = useState<Resena[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('reviews')
        .select('id, rating, text, created_at, place:places(id, name, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setResenas((data as any[]).map(r => ({
          id:     String(r.id),
          lugar:  r.place?.name ?? 'Lugar',
          rating: r.rating,
          fecha:  new Date(r.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }),
          texto:  r.text ?? '',
          emoji:  '⭐',
          href:   `/lugares/${r.place?.id ?? ''}`,
        })))
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const promedio = resenas.length
    ? Math.round(resenas.reduce((a, r) => a + r.rating, 0) / resenas.length * 10) / 10
    : 0
  const cinco = resenas.filter(r => r.rating === 5).length

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.title}>Mis reseñas</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
      ) : resenas.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: S.md }}>⭐</Text>
          <Text style={styles.emptyTitle}>Aún no escribiste reseñas</Text>
          <Text style={styles.emptySub}>Comparte tu experiencia en lugares y eventos</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/lugares')}>
            <Text style={styles.emptyBtnText}>Ver lugares →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: S.lg }}>
          {/* RESUMEN */}
          <View style={styles.resumenCard}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.resumenNum, { color: T.orange }]}>{promedio}</Text>
              <Stars rating={Math.round(promedio)} />
              <Text style={styles.resumenLabel}>Promedio</Text>
            </View>
            <View style={styles.divider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.resumenNum, { color: T.purple }]}>{resenas.length}</Text>
              <Text style={styles.resumenLabel}>Reseñas escritas</Text>
            </View>
            <View style={styles.divider} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.resumenNum, { color: T.green }]}>{cinco}</Text>
              <Text style={styles.resumenLabel}>Con 5 estrellas</Text>
            </View>
          </View>

          {/* LISTA */}
          {resenas.map(r => (
            <TouchableOpacity key={r.id} style={styles.resenaCard} onPress={() => router.push(r.href as any)}>
              <View style={styles.resenaIcon}><Text style={{ fontSize: 22 }}>{r.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.resenaNombre}>{r.lugar}</Text>
                  <Text style={styles.resenaFecha}>{r.fecha}</Text>
                </View>
                <Stars rating={r.rating} />
                {r.texto ? <Text style={styles.resenaTexto}>{r.texto}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl },
  emptyTitle:   { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  emptySub:     { fontSize: F.size.sm, color: T.fg3, textAlign: 'center', marginTop: S.sm },
  emptyBtn:     { marginTop: S.md, paddingHorizontal: S.xl, paddingVertical: S.md, backgroundColor: T.purple, borderRadius: R.full },
  emptyBtnText: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  resumenCard:  { flexDirection: 'row', backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.lg, alignItems: 'center' },
  resumenNum:   { fontSize: 28, fontWeight: F.weight.bold, marginBottom: 4 },
  resumenLabel: { fontSize: F.size.xs, color: T.fg3, marginTop: 4, textAlign: 'center' },
  divider:      { width: 1, height: 48, backgroundColor: T.border, marginHorizontal: S.sm },
  resenaCard:   { flexDirection: 'row', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.sm },
  resenaIcon:   { width: 52, height: 52, borderRadius: R.md, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resenaNombre: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, flex: 1 },
  resenaFecha:  { fontSize: 10, color: T.fg3, flexShrink: 0, marginLeft: S.sm },
  resenaTexto:  { fontSize: F.size.xs, color: T.fg2, marginTop: 4, lineHeight: 18 },
})

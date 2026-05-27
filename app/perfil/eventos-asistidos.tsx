import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

type EventoAsistido = {
  id: string
  nombre: string
  categoria: string
  fecha: string
  lugar: string
  emoji: string
}

export default function EventosAsistidos() {
  const [eventos, setEventos] = useState<EventoAsistido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('event_attendees')
        .select('event:events(id, name, category, start_datetime, place:places(name))')
        .eq('user_id', user.id)
        .eq('status', 'going')
        .order('created_at', { ascending: false })

      if (data) {
        setEventos(
          (data as any[])
            .filter(d => d.event?.id)
            .map(d => ({
              id:        d.event.id,
              nombre:    d.event.name,
              categoria: d.event.category ?? '',
              fecha:     d.event.start_datetime
                ? new Date(d.event.start_datetime).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })
                : '',
              lugar: d.event.place?.name ?? '',
              emoji: getCatEmoji(d.event.category ?? ''),
            }))
        )
      }
      setLoading(false)
    }
    cargar()
  }, [])

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.title}>Mis entradas</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
      ) : eventos.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: S.md }}>🎟️</Text>
          <Text style={styles.emptyTitle}>Aún no asististe a eventos</Text>
          <Text style={styles.emptySub}>Confirma tu asistencia en los eventos que te interesen</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/eventos')}>
            <Text style={styles.emptyBtnText}>Ver eventos →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: S.lg }}>
          <Text style={styles.countText}>{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</Text>
          {eventos.map(ev => (
            <TouchableOpacity key={ev.id} style={styles.eventoCard} onPress={() => router.push(`/eventos/${ev.id}`)}>
              <View style={styles.eventoIcon}>
                <Text style={{ fontSize: 28 }}>{ev.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventoNombre}>{ev.nombre}</Text>
                {ev.fecha ? <Text style={styles.eventoMeta}>📅 {ev.fecha}</Text> : null}
                {ev.lugar ? <Text style={styles.eventoMeta}>📍 {ev.lugar}</Text> : null}
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Confirmado</Text>
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
  countText:    { fontSize: F.size.sm, color: T.fg3, marginBottom: S.md },
  eventoCard:   { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.sm },
  eventoIcon:   { width: 60, height: 60, borderRadius: R.md, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  eventoNombre: { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  eventoMeta:   { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  badge:        { paddingHorizontal: S.sm, paddingVertical: 4, backgroundColor: T.greenSoft, borderRadius: R.full },
  badgeText:    { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.greenInk },
})

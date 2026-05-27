import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { ArrowLeft, Calendar, MapPin, Users, Clock, Heart, Navigation } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { Event, Place } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

function formatFecha(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatFechaCorta(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function EventoDetalle() {
  const { id }     = useLocalSearchParams<{ id: string }>()
  const [evento,   setEvento]   = useState<Event | null>(null)
  const [lugar,    setLugar]    = useState<Place | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [asistire, setAsistire] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('events').select('*').eq('id', id).single()
      if (data) {
        setEvento(data)
        if (data.place_id) {
          const { data: pl } = await supabase
            .from('places').select('*').eq('id', data.place_id).single()
          if (pl) setLugar(pl)
        }
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={T.purple} /></View>
  )

  if (!evento) return (
    <View style={styles.center}>
      <Text style={styles.notFound}>Evento no encontrado</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Volver</Text>
      </TouchableOpacity>
    </View>
  )

  const emoji = getCatEmoji(evento.category)

  const abrirMaps = () => {
    if (lugar?.latitude && lugar?.longitude) {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lugar.latitude},${lugar.longitude}`)
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{evento.name}</Text>
        <TouchableOpacity style={styles.heartBtn} onPress={() => setAsistire(v => !v)}>
          <Heart size={20} color={asistire ? T.danger : T.fg3}
            fill={asistire ? T.danger : 'none'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HERO */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: T.orangeSoft }]}>
              <Text style={[styles.badgeText, { color: T.orange }]}>{evento.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: evento.is_free ? T.greenSoft : T.purpleSoft }]}>
              <Text style={[styles.badgeText, { color: evento.is_free ? T.green : T.purple }]}>
                {evento.is_free ? 'Gratis' : `Bs. ${evento.price}`}
              </Text>
            </View>
          </View>
        </View>

        {/* INFO PRINCIPAL */}
        <View style={styles.mainInfo}>
          <Text style={styles.nombre}>{evento.name}</Text>
          {evento.description && (
            <Text style={styles.description}>{evento.description}</Text>
          )}
        </View>

        {/* DETALLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: T.purpleSoft }]}>
              <Calendar size={16} color={T.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Inicio</Text>
              <Text style={styles.infoText}>{formatFecha(evento.start_datetime)}</Text>
            </View>
          </View>

          {evento.end_datetime && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: T.muted }]}>
                <Clock size={16} color={T.fg2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Fin</Text>
                <Text style={styles.infoText}>{formatFechaCorta(evento.end_datetime)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: T.greenSoft }]}>
              <Users size={16} color={T.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Asistentes</Text>
              <Text style={styles.infoText}>
                {evento.attendees_count ?? 0}
                {evento.capacity ? ` / ${evento.capacity}` : ''} personas
              </Text>
            </View>
          </View>
        </View>

        {/* LUGAR */}
        {lugar && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lugar</Text>
            <TouchableOpacity style={styles.lugarCard}
              onPress={() => router.push(`/lugares/${lugar.id}`)}>
              <View style={[styles.infoIcon, { backgroundColor: T.purpleSoft }]}>
                <MapPin size={16} color={T.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lugarNombre}>{lugar.name}</Text>
                {lugar.address && (
                  <Text style={styles.lugarAddr} numberOfLines={1}>{lugar.address}</Text>
                )}
              </View>
              <Text style={{ fontSize: 20, color: T.fg3 }}>›</Text>
            </TouchableOpacity>

            {lugar.latitude && lugar.longitude && (
              <TouchableOpacity style={styles.mapsBtn} onPress={abrirMaps}>
                <Navigation size={16} color={T.purple} />
                <Text style={styles.mapsBtnText}>Cómo llegar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* BOTÓN ASISTENCIA */}
        <TouchableOpacity
          style={[styles.asistirBtn, asistire && styles.asistirBtnActive]}
          onPress={() => setAsistire(v => !v)}>
          <Text style={[styles.asistirText, asistire && styles.asistirTextActive]}>
            {asistire ? '✓ Asistiré a este evento' : '¿Vas a ir?  Confirmar asistencia'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: T.bg },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  notFound:         { fontSize: F.size.lg, color: T.fg3 },
  backLink:         { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  header:           { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { flex: 1, fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  heartBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hero:             { height: 200, backgroundColor: T.orangeSoft, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji:        { fontSize: 80 },
  heroBadges:       { position: 'absolute', bottom: S.lg, flexDirection: 'row', gap: S.sm },
  badge:            { paddingHorizontal: S.md, paddingVertical: 5, borderRadius: R.full },
  badgeText:        { fontSize: F.size.sm, fontWeight: F.weight.semibold },
  mainInfo:         { backgroundColor: T.surface, padding: S.lg, borderBottomWidth: 1, borderBottomColor: T.border },
  nombre:           { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  description:      { fontSize: F.size.base, color: T.fg2, lineHeight: 22 },
  section:          { backgroundColor: T.surface, marginTop: S.md, padding: S.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border },
  sectionTitle:     { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.md },
  infoRow:          { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md },
  infoIcon:         { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoLabel:        { fontSize: F.size.xs, color: T.fg3, fontWeight: F.weight.medium, marginBottom: 2 },
  infoText:         { fontSize: F.size.base, color: T.fg1, textTransform: 'capitalize' },
  lugarCard:        { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, backgroundColor: T.muted, borderRadius: R.md, marginBottom: S.md },
  lugarNombre:      { fontSize: F.size.base, fontWeight: F.weight.bold, color: T.fg1 },
  lugarAddr:        { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  mapsBtn:          { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: S.sm, justifyContent: 'center', borderWidth: 1.5, borderColor: T.purple, borderRadius: R.lg },
  mapsBtnText:      { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  asistirBtn:       { margin: S.xl, height: 52, borderRadius: R.lg, borderWidth: 2, borderColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  asistirBtnActive: { backgroundColor: T.purple, borderColor: T.purple },
  asistirText:      { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.bold },
  asistirTextActive:{ color: '#fff' },
})

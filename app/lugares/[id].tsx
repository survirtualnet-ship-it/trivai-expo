import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, Navigation } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { Place } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export default function LugarDetalle() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const [lugar,  setLugar]  = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('places').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setLugar(data); setLoading(false) })
  }, [id])

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={T.purple} /></View>
  )

  if (!lugar) return (
    <View style={styles.center}>
      <Text style={styles.notFound}>Lugar no encontrado</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Volver</Text>
      </TouchableOpacity>
    </View>
  )

  const color   = getCatColor(lugar.category)
  const emoji   = getCatEmoji(lugar.category)
  const diaHoy  = DIAS[new Date().getDay()]
  const horario = lugar.hours?.[diaHoy] ?? null

  const abrirMaps = () => {
    if (lugar.latitude && lugar.longitude) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>{lugar.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HERO */}
        <View style={[styles.hero, { backgroundColor: color + '33' }]}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: color }]}>
            <Text style={styles.categoryText}>{lugar.category}</Text>
          </View>
        </View>

        {/* INFO PRINCIPAL */}
        <View style={styles.mainInfo}>
          <Text style={styles.nombre}>{lugar.name}</Text>

          <View style={styles.ratingRow}>
            <Star size={16} color={T.purple} fill={T.purple} />
            <Text style={styles.rating}>{lugar.rating_avg?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.reviews}>({lugar.rating_count ?? 0} reseñas)</Text>
            <View style={[styles.statusBadge,
              { backgroundColor: lugar.is_open ? T.greenSoft : T.muted }]}>
              <Text style={[styles.statusText,
                { color: lugar.is_open ? T.green : T.fg3 }]}>
                {lugar.is_open ? '● Abierto' : '● Cerrado'}
              </Text>
            </View>
          </View>

          {lugar.description && (
            <Text style={styles.description}>{lugar.description}</Text>
          )}
        </View>

        {/* DATOS DE CONTACTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          {lugar.address && (
            <TouchableOpacity style={styles.infoRow} onPress={abrirMaps}>
              <View style={[styles.infoIcon, { backgroundColor: T.purpleSoft }]}>
                <MapPin size={16} color={T.purple} />
              </View>
              <Text style={styles.infoText} numberOfLines={2}>{lugar.address}</Text>
            </TouchableOpacity>
          )}

          {lugar.phone && (
            <TouchableOpacity style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${lugar.phone}`)}>
              <View style={[styles.infoIcon, { backgroundColor: T.greenSoft }]}>
                <Phone size={16} color={T.green} />
              </View>
              <Text style={styles.infoText}>{lugar.phone}</Text>
            </TouchableOpacity>
          )}

          {lugar.website && (
            <TouchableOpacity style={styles.infoRow}
              onPress={() => Linking.openURL(lugar.website!)}>
              <View style={[styles.infoIcon, { backgroundColor: T.orangeSoft }]}>
                <Globe size={16} color={T.orange} />
              </View>
              <Text style={[styles.infoText, { color: T.purple }]} numberOfLines={1}>
                {lugar.website.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
          )}

          {horario && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: T.muted }]}>
                <Clock size={16} color={T.fg2} />
              </View>
              <Text style={styles.infoText}>Hoy: {horario}</Text>
            </View>
          )}
        </View>

        {/* HORARIOS */}
        {lugar.hours && Object.keys(lugar.hours).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horarios</Text>
            {DIAS.map(dia => {
              const h = lugar.hours?.[dia]
              if (!h) return null
              return (
                <View key={dia} style={styles.horarioRow}>
                  <Text style={[styles.horarioDia,
                    dia === diaHoy && { color: T.purple, fontWeight: F.weight.bold }]}>
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </Text>
                  <Text style={[styles.horarioHora,
                    dia === diaHoy && { color: T.purple }]}>{h}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* VER EN MAPA */}
        {lugar.latitude && lugar.longitude && (
          <TouchableOpacity style={styles.mapBtn} onPress={abrirMaps}>
            <Navigation size={18} color="#fff" />
            <Text style={styles.mapBtnText}>Ver en Google Maps</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  notFound:      { fontSize: F.size.lg, color: T.fg3 },
  backLink:      { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  header:        { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:   { flex: 1, fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  hero:          { height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji:     { fontSize: 72 },
  categoryBadge: { position: 'absolute', bottom: S.lg, paddingHorizontal: S.md, paddingVertical: 4, borderRadius: R.full },
  categoryText:  { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: '#fff' },
  mainInfo:      { backgroundColor: T.surface, padding: S.lg, borderBottomWidth: 1, borderBottomColor: T.border },
  nombre:        { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: S.sm, flexWrap: 'wrap' },
  rating:        { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.bold },
  reviews:       { fontSize: F.size.sm, color: T.fg3 },
  statusBadge:   { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.full },
  statusText:    { fontSize: F.size.xs, fontWeight: F.weight.semibold },
  description:   { fontSize: F.size.base, color: T.fg2, lineHeight: 22, marginTop: S.md },
  section:       { backgroundColor: T.surface, marginTop: S.md, padding: S.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border },
  sectionTitle:  { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.md },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md },
  infoIcon:      { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoText:      { flex: 1, fontSize: F.size.base, color: T.fg1 },
  horarioRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  horarioDia:    { fontSize: F.size.base, color: T.fg2, textTransform: 'capitalize' },
  horarioHora:   { fontSize: F.size.base, color: T.fg2 },
  mapBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.xl, height: 52, borderRadius: R.lg, backgroundColor: T.purple, shadowColor: T.purple, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  mapBtnText:    { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
})

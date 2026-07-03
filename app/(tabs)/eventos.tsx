import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, X, MapPin, Calendar, ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

interface Evento {
  id: string; name: string; category: string
  start_datetime: string; is_free: boolean; price: number
  place?: { name: string; address: string | null } | null
}

const FILTROS = ['Todos', 'Hoy', 'Gratuitos', 'Música', 'Arte', 'Cultura']

const DIAS_ES  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function generarDias(n = 30) {
  const hoy = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i)
    return { dia: DIAS_ES[d.getDay()], num: String(d.getDate()), mes: MESES_ES[d.getMonth()], date: d }
  })
}

function formatFecha(dt: string) {
  const d = new Date(dt)
  const hoy = new Date()
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1)
  const hora = d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`
  if (d.toDateString() === manana.toDateString()) return `Mañana, ${hora}`
  return d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function esHoy(dt: string) {
  return new Date(dt).toDateString() === new Date().toDateString()
}

export default function Eventos() {
  const [eventos,       setEventos]       = useState<Evento[]>([])
  const [loading,       setLoading]       = useState(true)
  const [filtro,        setFiltro]        = useState('Todos')
  const [diaActivo,     setDiaActivo]     = useState<number | null>(null)
  const [buscando,      setBuscando]      = useState(false)
  const [busqueda,      setBusqueda]      = useState('')
  const [dias]                            = useState(generarDias(30))
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('events')
        .select('id,name,category,start_datetime,is_free,price,place:places(name,address)')
        .eq('is_active', true)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(50)
      if (data) setEventos(data as Evento[])
      setLoading(false)
    }
    fetch()
  }, [])

  useEffect(() => {
    if (buscando) setTimeout(() => inputRef.current?.focus(), 100)
  }, [buscando])

  const eventosFiltrados = eventos.filter(ev => {
    if (busqueda.trim().length >= 2) {
      return ev.name.toLowerCase().includes(busqueda.toLowerCase())
    }
    if (diaActivo !== null) {
      const diaSelec = dias[diaActivo].date
      const evDate = new Date(ev.start_datetime)
      if (evDate.toDateString() !== diaSelec.toDateString()) return false
    }
    if (filtro === 'Hoy') return esHoy(ev.start_datetime)
    if (filtro === 'Gratuitos') return ev.is_free
    if (filtro === 'Música') return ev.category === 'Música'
    if (filtro === 'Arte') return ev.category === 'Arte' || ev.category === 'Arte y cultura'
    if (filtro === 'Cultura') return ev.category === 'Arte y cultura' || ev.category === 'Cultura'
    return true
  })

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* TOPBAR */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <ArrowLeft size={24} color={T.fg1} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Eventos</Text>
        <TouchableOpacity
          style={[styles.searchBtn, buscando && { backgroundColor: T.purpleSoft }]}
          onPress={() => { setBuscando(v => !v); setBusqueda('') }}
        >
          <Search size={20} color={buscando ? T.purple : T.fg2} />
        </TouchableOpacity>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      {buscando && (
        <View style={styles.searchBar}>
          <Search size={16} color={T.fg3} />
          <TextInput
            ref={inputRef}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar eventos por nombre..."
            placeholderTextColor={T.fg3}
            style={styles.searchInput}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <X size={16} color={T.fg3} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* FILTROS */}
        {!buscando && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtros}>
            {FILTROS.map(f => (
              <TouchableOpacity key={f}
                style={[styles.chip, filtro === f && styles.chipActive]}
                onPress={() => { setFiltro(f); setDiaActivo(null) }}>
                <Text style={[styles.chipText, filtro === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* SELECTOR DE DÍAS */}
        {!buscando && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dias}>
            {dias.map((d, i) => {
              const sel = diaActivo === i
              return (
                <TouchableOpacity key={i}
                  style={[styles.diaBtn, sel && styles.diaBtnActive]}
                  onPress={() => setDiaActivo(prev => prev === i ? null : i)}>
                  <Text style={[styles.diaDia, sel && styles.diaTextoActive]}>{d.dia}</Text>
                  <Text style={[styles.diaNum, sel && styles.diaTextoActive]}>{d.num}</Text>
                  <Text style={[styles.diaMes, sel && styles.diaTextoActive]}>{d.mes}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}

        {/* CABECERA LISTA */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {buscando && busqueda.length >= 2
              ? `${eventosFiltrados.length} resultado${eventosFiltrados.length !== 1 ? 's' : ''}`
              : diaActivo !== null
              ? `${dias[diaActivo].dia} ${dias[diaActivo].num} ${dias[diaActivo].mes}`
              : `Todos los eventos (${eventosFiltrados.length})`}
          </Text>
          <TouchableOpacity onPress={() => router.push('/mapa')}>
            <Text style={styles.sectionAction}>Ver mapa</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator color={T.purple} style={{ marginTop: 40 }} />
        ) : eventosFiltrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No hay eventos para este filtro</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: S.lg }}>
            {eventosFiltrados.map(ev => (
              <TouchableOpacity key={ev.id} style={styles.row}
                onPress={() => router.push(`/eventos/${ev.id}`)}>
                <View style={styles.rowIcon}>
                  <Text style={{ fontSize: 26 }}>{getCatEmoji(ev.category)}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={2}>{ev.name}</Text>
                  <Text style={styles.rowCat}>{ev.category}</Text>
                  <View style={styles.rowMeta}>
                    <Calendar size={11} color={T.fg3} />
                    <Text style={styles.rowMetaText}>{formatFecha(ev.start_datetime)}</Text>
                  </View>
                  {ev.place && (
                    <View style={styles.rowMeta}>
                      <MapPin size={11} color={T.fg3} />
                      <Text style={styles.rowMetaText} numberOfLines={1}>{ev.place.name}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.badge,
                  { backgroundColor: ev.is_free ? T.greenSoft : T.purpleSoft }]}>
                  <Text style={[styles.badgeText,
                    { color: ev.is_free ? T.green : T.purple }]}>
                    {ev.is_free ? 'Gratis' : `Bs. ${ev.price}`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.bg },
  topbar:          { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:         { padding: 2 },
  title:           { flex: 1, fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  searchBtn:       { width: 36, height: 36, borderRadius: R.full, alignItems: 'center', justifyContent: 'center' },
  searchBar:       { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  searchInput:     { flex: 1, fontSize: F.size.base, color: T.fg1, paddingVertical: 8 },
  filtros:         { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: S.sm },
  chip:            { paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  chipActive:      { backgroundColor: T.green, borderColor: T.green },
  chipText:        { fontSize: F.size.base, fontWeight: F.weight.semibold, color: T.fg2 },
  chipTextActive:  { color: '#fff' },
  dias:            { paddingHorizontal: S.lg, paddingBottom: S.sm, gap: S.sm },
  diaBtn:          { width: 56, paddingVertical: S.sm, borderRadius: R.md, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  diaBtnActive:    { backgroundColor: T.green, borderColor: T.green },
  diaDia:          { fontSize: F.size.xs, fontWeight: F.weight.semibold, color: T.fg3 },
  diaNum:          { fontSize: 20, fontWeight: F.weight.bold, color: T.fg1, marginVertical: 2 },
  diaMes:          { fontSize: F.size.xs, color: T.fg3 },
  diaTextoActive:  { color: '#fff' },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.md, marginBottom: S.sm },
  sectionTitle:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:   { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  empty:           { alignItems: 'center', paddingTop: 48 },
  emptyIcon:       { fontSize: 40, marginBottom: S.md },
  emptyText:       { fontSize: F.size.base, color: T.fg3 },
  row:             { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon:         { width: 64, height: 64, borderRadius: R.md, backgroundColor: T.orangeSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowContent:      { flex: 1 },
  rowTitle:        { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: 2 },
  rowCat:          { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold, marginBottom: 3 },
  rowMeta:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rowMetaText:     { fontSize: F.size.xs, color: T.fg3, flex: 1 },
  badge:           { paddingHorizontal: S.sm, paddingVertical: 4, borderRadius: R.full, alignSelf: 'flex-start', marginTop: 4 },
  badgeText:       { fontSize: F.size.xs, fontWeight: F.weight.semibold },
})

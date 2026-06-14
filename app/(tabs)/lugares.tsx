import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, MapPin, Star } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'

interface Place {
  id: string; name: string; category: string
  address: string | null; rating_avg: number
  rating_count: number; is_open: boolean
}

const CATEGORIAS = [
  { id: 'Todos',         label: 'Todos',         emoji: '🗺️' },
  { id: 'Restaurante',   label: 'Restaurantes',  emoji: '🍽️' },
  { id: 'Cafetería',     label: 'Cafés',         emoji: '☕' },
  { id: 'Arte y cultura',label: 'Arte',          emoji: '🎨' },
  { id: 'Entretenimiento',label: 'Eventos',      emoji: '🎟️' },
  { id: 'Otros',         label: 'Otros',         emoji: '📍' },
]

const ZONAS = [
  { nombre: 'Centro',     emoji: '🏛️', color: '#3a3340' },
  { nombre: 'Equipetrol', emoji: '🍺', color: '#21121a' },
  { nombre: 'Las Palmas', emoji: '🌳', color: '#274a30' },
  { nombre: 'Urbarí',     emoji: '🖼️', color: '#3a1d4e' },
]

export default function Lugares() {
  const [lugares,       setLugares]       = useState<Place[]>([])
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [loading,       setLoading]       = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [cat,           setCat]           = useState('Todos')
  const [busqueda,      setBusqueda]      = useState('')
  const [buscando,      setBuscando]      = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let q = supabase.from('places')
        .select('id,name,category,address,rating_avg,rating_count,is_open')
        .not('latitude', 'is', null)
        .order('rating_avg', { ascending: false })
        .limit(40)

      if (cat !== 'Todos' && cat !== 'Otros') {
        const cats = cat === 'Restaurante'
          ? ['Restaurante', 'Gastronomía']
          : cat === 'Arte y cultura'
          ? ['Arte y cultura', 'Arte', 'Música']
          : [cat]
        q = q.in('category', cats)
      } else if (cat === 'Otros') {
        q = q.in('category', ['Parque', 'Bar', 'Deportes', 'Naturaleza', 'Mercado'])
      }

      const { data } = await q
      if (data) setLugares(data)
      setLoading(false)
    }
    load()
  }, [cat])

  // Búsqueda directa en Supabase (debounced)
  useEffect(() => {
    const term = busqueda.trim()
    if (term.length < 2) { setSearchResults([]); return }

    setSearchLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('places')
        .select('id,name,category,address,rating_avg,rating_count,is_open')
        .ilike('name', `%${term}%`)
        .order('rating_avg', { ascending: false })
        .limit(40)
      if (data) setSearchResults(data)
      setSearchLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [busqueda])

  const filtrados = busqueda.trim().length >= 2 ? searchResults : lugares

  const destacados = filtrados.slice(0, 5)
  const resto      = filtrados.slice(5)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* TOPBAR */}
      <View style={styles.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Lugares</Text>
          <Text style={styles.sub}>Descubre los mejores lugares</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}
          onPress={() => { setBuscando(v => !v); setBusqueda('') }}>
          <Search size={20} color={buscando ? T.purple : T.fg2} />
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      {buscando && (
        <View style={styles.searchBar}>
          <Search size={16} color={T.fg3} />
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar lugares..."
            placeholderTextColor={T.fg3}
            autoFocus
          />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cats}>
          {CATEGORIAS.map(c => (
            <TouchableOpacity key={c.id}
              style={[styles.catChip, cat === c.id && styles.catChipActive]}
              onPress={() => setCat(c.id)}>
              <Text style={styles.catEmoji}>{c.emoji}</Text>
              <Text style={[styles.catLabel, cat === c.id && styles.catLabelActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* UBICACIÓN */}
        <View style={styles.ubicacion}>
          <MapPin size={18} color={T.purple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ubicacionCity}>Santa Cruz de la Sierra</Text>
            <Text style={styles.ubicacionSub}>Ajustar ubicación</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        {loading || searchLoading ? (
          <ActivityIndicator color={T.purple} style={{ marginTop: 40 }} />
        ) : filtrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Sin resultados para "{cat}"</Text>
            <TouchableOpacity onPress={() => setCat('Todos')}>
              <Text style={styles.emptyAction}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* DESTACADOS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {cat !== 'Todos' ? `${CATEGORIAS.find(c => c.id === cat)?.label} (${filtrados.length})` : 'Destacados'}
              </Text>
              <TouchableOpacity><Text style={styles.sectionAction}>Ver todos</Text></TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={destacados}
              keyExtractor={i => i.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: S.lg, gap: 12, paddingBottom: 4 }}
              renderItem={({ item }) => <CardLugar item={item} />}
            />

            {/* ZONAS — solo en "Todos" */}
            {cat === 'Todos' && !buscando && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Explorar por zona</Text>
                  <TouchableOpacity onPress={() => router.push(`/mapa`)}>
                    <Text style={styles.sectionAction}>Ver mapa</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: S.lg, gap: 10 }}>
                  {ZONAS.map(z => (
                    <TouchableOpacity key={z.nombre} style={[styles.zonaCard, { backgroundColor: z.color }]}
                      onPress={() => router.push(`/mapa?lat=${z.lat}&lng=${z.lng}&zona=${encodeURIComponent(z.nombre)}`)}>
                      <Text style={styles.zonaEmoji}>{z.emoji}</Text>
                      <Text style={styles.zonaNombre}>{z.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* LISTA */}
            {resto.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{cat !== 'Todos' ? `Más ${CATEGORIAS.find(c=>c.id===cat)?.label.toLowerCase()}` : 'Cerca de ti'}</Text>
                </View>
                <View style={{ paddingHorizontal: S.lg }}>
                  {resto.map(l => <RowLugar key={l.id} item={l} />)}
                </View>
              </>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

function CardLugar({ item }: { item: Place }) {
  const color = getCatColor(item.category)
  const emoji = getCatEmoji(item.category)
  return (
    <TouchableOpacity style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}
      onPress={() => router.push(`/lugares/${item.id}`)}>
      <View style={[styles.cardIcon, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 24 }}>{emoji}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.cardCat} numberOfLines={1}>{item.category}</Text>
      <View style={styles.cardRow}>
        <Star size={12} color={T.purple} fill={T.purple} />
        <Text style={styles.cardRating}>{item.rating_avg?.toFixed(1) ?? '—'}</Text>
        <Text style={styles.cardReviews}>({item.rating_count ?? 0})</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: item.is_open ? T.greenSoft : T.muted, marginTop: 6 }]}>
        <Text style={[styles.badgeText, { color: item.is_open ? T.green : T.fg3 }]}>
          {item.is_open ? 'Abierto' : 'Cerrado'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function RowLugar({ item }: { item: Place }) {
  const color = getCatColor(item.category)
  const emoji = getCatEmoji(item.category)
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/lugares/${item.id}`)}>
      <View style={[styles.rowIcon, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowCat}>{item.category}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Star size={11} color={T.purple} fill={T.purple} />
          <Text style={styles.rowRating}>{item.rating_avg?.toFixed(1) ?? '—'}</Text>
          {item.address && <Text style={styles.rowAddr} numberOfLines={1}> · {item.address}</Text>}
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: item.is_open ? T.greenSoft : T.muted }]}>
        <Text style={[styles.badgeText, { color: item.is_open ? T.green : T.fg3 }]}>
          {item.is_open ? 'Abierto' : 'Cerrado'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: T.bg },
  topbar:         { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:          { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  sub:            { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  iconBtn:        { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  searchBar:      { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  searchInput:    { flex: 1, fontSize: F.size.base, color: T.fg1, paddingVertical: 8 },
  cats:           { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: S.sm },
  catChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  catChipActive:  { backgroundColor: T.purple, borderColor: T.purple },
  catEmoji:       { fontSize: 14 },
  catLabel:       { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  catLabelActive: { color: '#fff' },
  ubicacion:      { flexDirection: 'row', alignItems: 'center', gap: S.md, margin: S.lg, backgroundColor: T.surface, borderRadius: R.md, padding: S.md, borderWidth: 1, borderColor: T.border },
  ubicacionCity:  { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  ubicacionSub:   { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold, marginTop: 2 },
  chevron:        { fontSize: 20, color: T.fg3 },
  empty:          { alignItems: 'center', paddingTop: 48 },
  emptyIcon:      { fontSize: 40, marginBottom: S.md },
  emptyText:      { fontSize: F.size.base, color: T.fg1, fontWeight: F.weight.bold, marginBottom: S.sm },
  emptyAction:    { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.lg, marginBottom: S.sm },
  sectionTitle:   { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:  { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  card:           { width: 180, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardIcon:       { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  cardTitle:      { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: 2 },
  cardCat:        { fontSize: F.size.sm, color: T.fg3, marginBottom: S.sm },
  cardRow:        { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardRating:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.bold },
  cardReviews:    { fontSize: F.size.xs, color: T.fg3 },
  badge:          { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.full, alignSelf: 'flex-start' },
  badgeText:      { fontSize: F.size.xs, fontWeight: F.weight.semibold },
  zonaCard:       { width: 130, height: 90, borderRadius: R.lg, padding: S.md, justifyContent: 'flex-end' },
  zonaEmoji:      { fontSize: 22, position: 'absolute', top: 10, right: 10 },
  zonaNombre:     { fontSize: F.size.md, fontWeight: F.weight.bold, color: '#fff' },
  row:            { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon:        { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowContent:     { flex: 1 },
  rowTitle:       { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  rowCat:         { fontSize: F.size.sm, color: T.fg3, marginTop: 1 },
  rowRating:      { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.bold },
  rowAddr:        { fontSize: F.size.xs, color: T.fg3, flex: 1 },
})

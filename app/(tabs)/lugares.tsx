import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Search, MapPin, ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, PLACE_CATEGORY_FILTERS, normalizeCategory, getCatColor } from '@/lib/tokens'
import { TrivaiHeader } from '@/components/TrivaiHeader'
import { DiscoveryCard } from '@/components/DiscoveryCard'
import { DiscoveryRow } from '@/components/DiscoveryRow'
import { CategoryChip } from '@/components/CategoryChip'
import { calcIsOpen } from '@/lib/hours'

interface Place {
  id: string; name: string; category: string
  address: string | null; rating_avg: number
  rating_count: number; is_open: boolean
  hours?: Record<string, string> | null
}

const ZONAS = [
  { nombre: 'Centro',     emoji: '🏛️', color: '#3a3340', lat: -17.7833, lng: -63.1821 },
  { nombre: 'Equipetrol', emoji: '🍺', color: '#21121a', lat: -17.7697, lng: -63.2017 },
  { nombre: 'Las Palmas', emoji: '🌳', color: '#274a30', lat: -17.7521, lng: -63.1919 },
  { nombre: 'Urbarí',     emoji: '🖼️', color: '#3a1d4e', lat: -17.7992, lng: -63.1734 },
]

export default function Lugares() {
  const { cat: catParam } = useLocalSearchParams<{ cat?: string }>()
  const [lugares,       setLugares]       = useState<Place[]>([])
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [loading,       setLoading]       = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [cat,           setCat]           = useState(typeof catParam === 'string' && catParam ? catParam : 'Todos')

  // Si llega un filtro por parámetro (ej. desde las categorías del Home), aplicarlo
  useEffect(() => {
    if (typeof catParam === 'string' && catParam) setCat(catParam)
  }, [catParam])
  const [busqueda,      setBusqueda]      = useState('')
  const [buscando,      setBuscando]      = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let q = supabase.from('places')
        .select('id,name,category,address,rating_avg,rating_count,is_open,hours')
        .not('latitude', 'is', null)
        .order('rating_avg', { ascending: false })
        .limit(40)

      if (cat !== 'Todos') {
        q = q.eq('category', cat)
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
        .select('id,name,category,address,rating_avg,rating_count,is_open,hours')
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
      <TrivaiHeader
        title="Lugares"
        subtitle={<Text style={styles.sub}>Descubre los mejores lugares cerca de ti</Text>}
        left={
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <ArrowLeft size={24} color={T.fg1} strokeWidth={2} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity style={styles.iconBtn}
            onPress={() => { setBuscando(v => !v); setBusqueda('') }}>
            <Search size={20} color={buscando ? T.purple : T.fg2} />
          </TouchableOpacity>
        }
      />

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
          {PLACE_CATEGORY_FILTERS.map(c => (
            <CategoryChip
              key={c.id}
              id={c.id}
              label={c.label}
              emoji={c.emoji}
              active={cat === c.id}
              onPress={() => setCat(c.id)}
            />
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
                {cat !== 'Todos' ? `${PLACE_CATEGORY_FILTERS.find(c => c.id === cat)?.label} (${filtrados.length})` : 'Destacados'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/buscar')}>
                <Text style={styles.sectionAction}>Ver todos</Text>
              </TouchableOpacity>
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
                  <Text style={styles.sectionTitle}>{cat !== 'Todos' ? `Más ${PLACE_CATEGORY_FILTERS.find(c=>c.id===cat)?.label.toLowerCase()}` : 'Cerca de ti'}</Text>
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
  const isOpen = calcIsOpen(item.hours, item.is_open)
  return (
    <DiscoveryCard
      category={item.category}
      title={item.name}
      subtitle={item.rating_avg ? `★ ${item.rating_avg.toFixed(1)} (${item.rating_count ?? 0})` : normalizeCategory(item.category)}
      pillLabel={normalizeCategory(item.category)}
      pillColor={getCatColor(item.category)}
      badge={
        <Text style={{ fontSize: F.size.xs }}>
          <Text style={{ color: T.fg3 }}>{normalizeCategory(item.category)} · </Text>
          <Text style={{ color: isOpen ? T.green : T.fg3, fontWeight: F.weight.semibold }}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </Text>
        </Text>
      }
      onPress={() => router.push(`/lugares/${item.id}`)}
    />
  )
}

function RowLugar({ item }: { item: Place }) {
  const isOpen = calcIsOpen(item.hours, item.is_open)
  return (
    <DiscoveryRow
      category={item.category}
      title={item.name}
      status={{ label: isOpen ? 'Abierto' : 'Cerrado', color: isOpen ? T.green : T.fg3 }}
      lines={[item.address ?? ''].filter(Boolean)}
      onPress={() => router.push(`/lugares/${item.id}`)}
    />
  )
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: T.bg },
  backBtn:        { padding: 2 },
  sub:            { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  iconBtn:        { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchBar:      { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.sm, borderRadius: R.full, paddingHorizontal: S.md, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  searchInput:    { flex: 1, fontSize: F.size.base, color: T.fg1, paddingVertical: 8 },
  cats:           { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: S.sm },
  ubicacion:      { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.sm, backgroundColor: T.purpleSoft, borderRadius: R.lg, padding: S.md },
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
  zonaCard:       { width: 130, height: 90, borderRadius: R.lg, padding: S.md, justifyContent: 'flex-end' },
  zonaEmoji:      { fontSize: 22, position: 'absolute', top: 10, right: 10 },
  zonaNombre:     { fontSize: F.size.md, fontWeight: F.weight.bold, color: '#fff' },
})

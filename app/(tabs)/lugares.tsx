import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Search, SlidersHorizontal, LayoutGrid,
  UtensilsCrossed, Palette, Trees, Sparkles,
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, normalizeCategory, getCatColor, getCatLabel } from '@/lib/tokens'
import { deferredPush } from '@/lib/deferredNav'
import { AppHeader, ProfileAvatar } from '@/components/ui/AppHeader'
import { PlaceCard } from '@/components/ui/PlaceCard'
import { DiscoveryCard } from '@/components/DiscoveryCard'
import { getCurrentCoords } from '@/lib/geolocation'
import { ENV } from '@/lib/env'
import { dedupePlaces } from '@/lib/places'

interface Place {
  id: string; name: string; category: string
  address: string | null; rating_avg: number
  rating_count: number; is_open: boolean
  hours?: Record<string, string> | null
  latitude?: number | null; longitude?: number | null
  _dist?: number
}

interface Recomendacion {
  id: string
  placeId: string
  lugar: string
  categoria: string
  quien: string
  ini: string
  color: string
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return rad * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km: number) {
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'
}

/** Píldoras de categorías oficiales — activa con color sólido de marca */
const PILLS: {
  id: string
  label: string
  Icon: typeof Search
  color: string
  bg: string
}[] = [
  { id: 'Gastronomía',     label: 'Gastronomía',     Icon: UtensilsCrossed, color: T.orange, bg: T.orangeSoft },
  { id: 'Entretenimiento', label: 'Entretenimiento', Icon: Palette,         color: T.purple, bg: T.purpleSoft },
  { id: 'Parques',         label: 'Parques',         Icon: Trees,           color: T.green,  bg: T.greenSoft },
  { id: 'Otros',           label: 'Otros',           Icon: Sparkles,        color: T.fg2,    bg: T.muted },
]

/** Mapa estático de Santa Cruz sin marcadores (sin pines) */
const MAP_PREVIEW_URI = ENV.googleMapsKey
  ? `https://maps.googleapis.com/maps/api/staticmap?center=-17.7833,-63.1821&zoom=13&size=640x280&scale=2&style=feature:poi|visibility:off&key=${ENV.googleMapsKey}`
  : null

export default function Lugares() {
  const { initials, avatarUrl } = useUser()
  const { cat: catParam } = useLocalSearchParams<{ cat?: string }>()
  const [lugares,       setLugares]       = useState<Place[]>([])
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [recos,         setRecos]         = useState<Recomendacion[]>([])
  const [loading,       setLoading]       = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [cat,           setCat]           = useState(typeof catParam === 'string' && catParam ? catParam : '')
  const [busqueda,      setBusqueda]      = useState('')
  const [userCoords,    setUserCoords]    = useState<{ lat: number; lng: number } | null>(null)

  // Si llega un filtro por parámetro (ej. desde las categorías del Home), aplicarlo
  useEffect(() => {
    if (typeof catParam === 'string' && catParam) setCat(catParam)
  }, [catParam])

  // Geolocalización para distancias
  useEffect(() => {
    getCurrentCoords().then(coords => { if (coords) setUserCoords(coords) })
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let q = supabase.from('places')
        .select('id,name,category,address,rating_avg,rating_count,is_open,hours,latitude,longitude')
        .not('latitude', 'is', null)
        .order('rating_avg', { ascending: false })
        .limit(40)

      if (cat) q = q.eq('category', cat)

      const { data } = await q
      if (data) setLugares(dedupePlaces(data))
      setLoading(false)
    }
    load()
  }, [cat])

  // Sección social: lugares favoritos de mis amigos
  useEffect(() => {
    const loadRecos = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const [f1, f2] = await Promise.all([
        supabase.from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted'),
        supabase.from('friendships').select('user_id').eq('friend_id', user.id).eq('status', 'accepted'),
      ])
      const friendIds = [...new Set([
        ...(f1.data ?? []).map((f: any) => f.friend_id),
        ...(f2.data ?? []).map((f: any) => f.user_id),
      ])]
      if (friendIds.length === 0) return

      const { data: favs } = await supabase
        .from('favorites')
        .select('place:places(id,name,category), profile:profiles(full_name)')
        .in('user_id', friendIds)
        .limit(5)

      if (favs) {
        const COLORES = [T.purpleSoft, T.orangeSoft, T.greenSoft, T.muted]
        setRecos((favs as any[])
          .filter(f => f.place?.id && f.profile?.full_name)
          .map((f, i) => ({
            id:        f.place.id + i,
            placeId:   f.place.id,
            lugar:     f.place.name,
            categoria: f.place.category,
            quien:     f.profile.full_name.split(' ')[0],
            ini:       f.profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
            color:     COLORES[i % 4],
          }))
        )
      }
    }
    loadRecos()
  }, [])

  // Búsqueda directa en Supabase (debounced)
  useEffect(() => {
    const term = busqueda.trim()
    if (term.length < 2) { setSearchResults([]); return }

    setSearchLoading(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('places')
        .select('id,name,category,address,rating_avg,rating_count,is_open,hours,latitude,longitude')
        .ilike('name', `%${term}%`)
        .order('rating_avg', { ascending: false })
        .limit(40)
      if (data) setSearchResults(dedupePlaces(data))
      setSearchLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [busqueda])

  const buscando = busqueda.trim().length >= 2

  // Distancias + orden por cercanía en la lista
  const conDist: Place[] = (buscando ? searchResults : lugares).map(l =>
    userCoords && l.latitude && l.longitude
      ? { ...l, _dist: haversineKm(userCoords.lat, userCoords.lng, l.latitude, l.longitude) }
      : l
  )

  const destacados = conDist.slice(0, 6)
  const cercanos   = [...conDist]
    .filter(l => !destacados.some(d => d.id === l.id))
    .sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999))
    .slice(0, 6)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 1. HEADER */}
        <AppHeader
          title="Lugares"
          left={<ProfileAvatar initials={initials} avatarUrl={avatarUrl} onPress={() => deferredPush('/perfil')} />}
          right={
            <TouchableOpacity style={styles.roundBtnSurface} onPress={() => router.push('/buscar')}>
              <SlidersHorizontal size={18} color={T.fg2} />
            </TouchableOpacity>
          }
        />

        {/* 2. BUSCADOR */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={17} color={T.fg3} />
            <TextInput
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar restaurantes, cafés..."
              placeholderTextColor={T.fg3}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => router.push('/buscar')} hitSlop={8}>
              <SlidersHorizontal size={16} color={T.purple} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {PILLS.map(p => {
            const activo = cat === p.id
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, { backgroundColor: activo ? p.color : p.bg }]}
                onPress={() => setCat(activo ? '' : p.id)}
                activeOpacity={0.75}
              >
                <p.Icon size={14} color={activo ? '#fff' : p.color} strokeWidth={2} />
                <Text style={[styles.chipText, { color: activo ? '#fff' : p.color }]}>{p.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* 4. CTA — gradiente naranja + verde */}
        <LinearGradient
          colors={[T.orange, T.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Explora nuevos lugares con amigos</Text>
            <Text style={styles.ctaSub}>Comparte tus sitios favoritos.</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/amigos')} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Invitar</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 5. VISTA PREVIA DEL MAPA (sin pines) */}
        <View style={styles.mapCard}>
          {MAP_PREVIEW_URI ? (
            <Image source={{ uri: MAP_PREVIEW_URI }} style={styles.mapImg} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[T.greenSoft, T.purpleSoft]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.mapImg}
            />
          )}
          <View style={styles.mapOverlay}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapCity}>Santa Cruz de la Sierra</Text>
              <Text style={styles.mapHint}>Explora los alrededores</Text>
            </View>
            <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/mapa')} activeOpacity={0.85}>
              <Text style={styles.mapBtnText}>Ver en mapa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading || searchLoading ? (
          <ActivityIndicator color={T.purple} style={{ marginTop: 40 }} />
        ) : conDist.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {buscando ? `Sin resultados para "${busqueda.trim()}"` : 'Sin resultados'}
            </Text>
            <TouchableOpacity onPress={() => { setCat(''); setBusqueda('') }}>
              <Text style={styles.emptyAction}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 6. DESTACADOS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {cat ? `${getCatLabel(cat)} (${conDist.length})` : 'Destacados'}
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

                {/* 7. CERCA DE TI */}
            {cercanos.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Cerca de ti</Text>
                </View>
                <View style={{ paddingHorizontal: S.lg, gap: S.md }}>
                  {cercanos.map(l => (
                    <PlaceCard key={l.id} place={l} onPress={() => deferredPush(`/lugares/${l.id}`)} />
                  ))}
                </View>
              </>
            )}

            {/* 8. TUS AMIGOS RECOMIENDAN */}
            {recos.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tus amigos recomiendan</Text>
                </View>
                <TouchableOpacity
                  style={styles.socialCard}
                  onPress={() => router.push(`/lugares/${recos[0].placeId}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.socialAvatars}>
                    {recos.slice(0, 3).map((r, i) => (
                      <View key={r.id} style={[styles.socialAvatar, { backgroundColor: r.color, marginLeft: i === 0 ? 0 : -12, zIndex: 3 - i }]}>
                        <Text style={styles.socialIni}>{r.ini}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.socialLugar} numberOfLines={1}>{recos[0].lugar}</Text>
                    <Text style={styles.socialTexto} numberOfLines={1}>
                      {recos[0].quien}
                      {recos.length > 1 ? ` y ${recos.length - 1} más lo recomiendan` : ' lo recomienda'}
                    </Text>
                  </View>
                  <Text style={{ color: T.fg4, fontSize: 18 }}>›</Text>
                </TouchableOpacity>
              </>
            )}

          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

/** Card destacada: badge Popular/Recomendado, rating y distancia */
function CardLugar({ item }: { item: Place }) {
  const popular = (item.rating_avg ?? 0) >= 4.5
  return (
    <DiscoveryCard
      category={item.category}
      title={item.name}
      subtitle={getCatLabel(item.category)}
      pillLabel={popular ? 'Popular' : 'Recomendado'}
      pillColor={popular ? T.orange : T.green}
      distance={item._dist != null ? `a ${formatDist(item._dist)}` : undefined}
      badge={
        item.rating_avg
          ? <Text style={{ fontSize: F.size.xs, color: T.fg2 }}>⭐ {item.rating_avg.toFixed(1)} ({item.rating_count ?? 0})</Text>
          : undefined
      }
      onPress={() => router.push(`/lugares/${item.id}`)}
    />
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  roundBtn:          { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  headerAvatar:      { width: 38, height: 38, borderRadius: 19 },
  headerIni:         { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  roundBtnSurface:   { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.lg },
  searchBox:         { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.bg, borderRadius: R.xl, paddingHorizontal: S.lg, height: 48 },
  searchInput:       { flex: 1, fontSize: F.size.sm, color: T.fg1, paddingVertical: 0 },
  chips:             { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: 4 },
  chip:              { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.lg, paddingVertical: 10, borderRadius: R.full },
  chipText:          { fontSize: F.size.sm, fontWeight: F.weight.semibold },
  // Mapa
  mapCard:           { marginHorizontal: S.lg, marginTop: S.xl, borderRadius: R.xl, overflow: 'hidden', backgroundColor: T.muted, shadowColor: '#15131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  mapImg:            { width: '100%', height: 120 },
  mapOverlay:        { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md },
  mapCity:           { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  mapHint:           { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  mapBtn:            { backgroundColor: T.purple, paddingHorizontal: S.lg, paddingVertical: 9, borderRadius: R.full },
  mapBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.xxl, marginBottom: S.md },
  sectionTitle:      { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.3 },
  sectionAction:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  empty:             { alignItems: 'center', paddingTop: 48 },
  emptyIcon:         { fontSize: 40, marginBottom: S.md },
  emptyText:         { fontSize: F.size.base, color: T.fg1, fontWeight: F.weight.bold, marginBottom: S.sm },
  emptyAction:       { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  // Social
  socialCard:        { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, backgroundColor: T.surface, borderRadius: R.xl, padding: S.lg, shadowColor: '#15131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  socialAvatars:     { flexDirection: 'row', alignItems: 'center' },
  socialAvatar:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  socialIni:         { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg1 },
  socialLugar:       { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  socialTexto:       { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  // CTA
  ctaCard:           { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.xxl, borderRadius: R.xl, padding: S.xl, shadowColor: T.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  ctaTitle:          { fontSize: F.size.xl, fontWeight: F.weight.bold, color: '#fff' },
  ctaSub:            { fontSize: F.size.sm, color: 'rgba(255,255,255,0.9)', marginTop: 3 },
  ctaBtn:            { backgroundColor: '#fff', paddingHorizontal: S.xl, paddingVertical: 11, borderRadius: R.full, flexShrink: 0 },
  ctaBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.orange },
})

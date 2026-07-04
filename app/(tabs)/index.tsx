import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Search, Bell, SlidersHorizontal, Ticket,
  UtensilsCrossed, Coffee, Moon, Palette,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'
import { TrivaiHeader } from '@/components/TrivaiHeader'
import { DiscoveryCard } from '@/components/DiscoveryCard'
import { DiscoveryRow } from '@/components/DiscoveryRow'
import { calcIsOpen } from '@/lib/hours'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'

interface Place {
  id: string; name: string; category: string
  address: string | null; rating_avg: number; is_open: boolean
  hours?: Record<string, string> | null
  latitude?: number | null; longitude?: number | null
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km: number) {
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'
}

interface Event {
  id: string; name: string; category: string
  start_datetime: string; is_free: boolean; price: number
  place?: { name: string } | null
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function esHoy(dt: string) {
  return new Date(dt).toDateString() === new Date().toDateString()
}

/** Card de evento destacado: badge "Hoy" o "Popular", fecha y lugar */
function CardEvento({ item }: { item: Event }) {
  const hoy = esHoy(item.start_datetime)
  return (
    <DiscoveryCard
      category={item.category}
      title={item.name}
      subtitle={formatDate(item.start_datetime)}
      pillLabel={hoy ? 'Hoy' : 'Popular'}
      pillColor={hoy ? T.green : T.orange}
      badge={item.place?.name
        ? <Text style={{ fontSize: F.size.xs, color: T.fg3 }} numberOfLines={1}>{item.place.name}</Text>
        : undefined}
      onPress={() => router.push(`/eventos/${item.id}`)}
    />
  )
}

function RowLugar({ item, dist }: { item: Place; dist?: number }) {
  const isOpen = calcIsOpen(item.hours, item.is_open)
  return (
    <DiscoveryRow
      category={item.category}
      title={item.name}
      status={{ label: isOpen ? 'Abierto' : 'Cerrado', color: isOpen ? T.green : T.fg3 }}
      rating={item.rating_avg || null}
      distance={dist != null ? `a ${formatDist(dist)}` : undefined}
      onPress={() => router.push(`/lugares/${item.id}`)}
    />
  )
}

/** Categorías de descubrimiento del Home */
const CATEGORIAS_HOME = [
  { label: 'Eventos',       Icon: Ticket,          color: '#FF6B2C', bg: '#FFE9DD', go: () => router.push('/eventos') },
  { label: 'Restaurantes',  Icon: UtensilsCrossed, color: '#2BB673', bg: '#DFF5EA', go: () => router.push({ pathname: '/lugares', params: { cat: 'Gastronomía' } }) },
  { label: 'Cafés',         Icon: Coffee,          color: '#FF6B2C', bg: '#FFE9DD', go: () => router.push({ pathname: '/lugares', params: { cat: 'Gastronomía' } }) },
  { label: 'Vida nocturna', Icon: Moon,            color: '#6C4CF1', bg: '#EBE6FD', go: () => router.push({ pathname: '/lugares', params: { cat: 'Entretenimiento' } }) },
  { label: 'Cultura',       Icon: Palette,         color: '#2BB673', bg: '#DFF5EA', go: () => router.push({ pathname: '/lugares', params: { cat: 'Entretenimiento' } }) },
]

interface ActividadAmigo {
  id: string
  quien: string
  ini: string
  accion: string
  nombre: string
  tipo: 'evento' | 'lugar'
  href: string
  color: string
}

export default function Inicio() {
  const { initials, avatarUrl } = useUser()
  const [lugares,     setLugares]     = useState<Place[]>([])
  const [eventos,     setEventos]     = useState<Event[]>([])
  const [actividad,   setActividad]   = useState<ActividadAmigo[]>([])
  const [loading,     setLoading]     = useState(true)
  const [sinLeer,     setSinLeer]     = useState(0)
  const [userCoords,  setUserCoords]  = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      const baseQueries: Promise<any>[] = [
        supabase.from('places').select('id,name,category,address,rating_avg,is_open,hours,latitude,longitude')
          .not('latitude', 'is', null).order('rating_avg', { ascending: false }).limit(20),
        supabase.from('events').select('id,name,category,start_datetime,is_free,price,place:places(name)')
          .eq('is_active', true).gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true }).limit(6),
      ]

      if (user) {
        baseQueries.push(
          supabase.from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted'),
          supabase.from('friendships').select('user_id').eq('friend_id', user.id).eq('status', 'accepted'),
          supabase.from('notifications').select('id, type').eq('user_id', user.id).eq('is_read', false)
        )
      }

      const results = await Promise.all(baseQueries)
      const [lugRes, evtRes, f1Res, f2Res, notifRes] = results

      if (lugRes?.data) setLugares(lugRes.data)
      if (evtRes?.data) setEventos(evtRes.data as Event[])
      if (notifRes?.data && user) {
        const prefs = await loadNotifPrefs(user.id)
        const count = (notifRes.data as { id: string; type: string }[])
          .filter(n => prefAllows(prefs, n.type ?? 'system')).length
        setSinLeer(count)
      }

      if (user && (f1Res?.data?.length || f2Res?.data?.length)) {
        const ids1 = (f1Res?.data ?? []).map((f: any) => f.friend_id)
        const ids2 = (f2Res?.data ?? []).map((f: any) => f.user_id)
        const friendIds = [...new Set([...ids1, ...ids2])]
        if (friendIds.length > 0) {
          const { data: asistencias } = await supabase
            .from('event_attendees')
            .select('event:events(id,name), profile:profiles(full_name,username)')
            .in('user_id', friendIds)
            .eq('status', 'going')
            .limit(5)
          if (asistencias) {
            const COLORES = [T.purpleSoft, T.orangeSoft, T.greenSoft, T.muted]
            setActividad((asistencias as any[])
              .filter(a => a.event?.id && a.profile?.full_name)
              .map((a, i) => ({
                id:     a.event.id + i,
                quien:  a.profile.full_name.split(' ')[0],
                ini:    a.profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
                accion: 'asistirá a',
                nombre: a.event.name,
                tipo:   'evento' as const,
                href:   `/eventos/${a.event.id}`,
                color:  COLORES[i % 4],
              }))
            )
          }
        }
      }

      setLoading(false)
    }
    fetch()
  }, [])

  // Realtime: badge en vivo cuando llega notificacion
  useEffect(() => {
    let channel: any = null
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id
      if (!userId) return
      channel = supabase
        .channel('notif-badge')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: 'user_id=eq.' + userId,
        }, async (payload) => {
          const tipo = (payload.new as any)?.type ?? 'system'
          const prefs = await loadNotifPrefs(userId)
          if (prefAllows(prefs, tipo)) setSinLeer(n => n + 1)
        })
        .subscribe()
    })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  // Geolocalización al montar
  useEffect(() => {
    getCurrentCoords().then(coords => {
      if (coords) setUserCoords(coords)
    })
  }, [])

  const lugaresCerca = userCoords
    ? [...lugares]
        .filter(l => l.latitude && l.longitude)
        .map(l => ({ ...l, _dist: haversineKm(userCoords.lat, userCoords.lng, l.latitude!, l.longitude!) }))
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 6)
    : lugares.slice(0, 6)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 1. HEADER */}
        <TrivaiHeader
          title="Explorar"
          subtitle={<Text style={styles.headerSub}>Descubre planes cerca de ti</Text>}
          left={
            <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/perfil')}>
              {avatarUrl
                ? <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                : <Text style={styles.avatarIni}>{initials}</Text>}
            </TouchableOpacity>
          }
          right={
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notificaciones')}>
              <Bell size={20} color={sinLeer > 0 ? T.purple : T.fg2} />
              {sinLeer > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{sinLeer > 9 ? '9+' : sinLeer}</Text>
                </View>
              )}
            </TouchableOpacity>
          }
        />

        {/* 2. BUSCADOR + FILTRO */}
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/buscar')} activeOpacity={0.8}>
            <Search size={17} color={T.fg3} />
            <Text style={styles.searchPlaceholder}>Buscar eventos, lugares...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/buscar')} activeOpacity={0.8}>
            <SlidersHorizontal size={18} color={T.purple} />
          </TouchableOpacity>
        </View>

        {/* 3. CATEGORÍAS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {CATEGORIAS_HOME.map(c => (
            <TouchableOpacity
              key={c.label}
              style={[styles.chip, { backgroundColor: c.bg }]}
              onPress={c.go}
              activeOpacity={0.75}
            >
              <c.Icon size={14} color={c.color} strokeWidth={2} />
              <Text style={[styles.chipText, { color: c.color }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. EVENTOS DESTACADOS */}
        {eventos.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Eventos destacados</Text>
              <TouchableOpacity onPress={() => router.push('/eventos')}>
                <Text style={styles.sectionAction}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={eventos.slice(0, 6)}
              keyExtractor={e => e.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: S.lg, gap: 12, paddingBottom: 4 }}
              renderItem={({ item }) => <CardEvento item={item} />}
            />
          </>
        )}

        {/* 5. CERCA DE TI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cerca de ti</Text>
          <TouchableOpacity onPress={() => router.push('/mapa')}>
            <Text style={styles.sectionAction}>Ver mapa</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: S.lg }}>
          {loading
            ? <ActivityIndicator color={T.purple} style={{ marginVertical: 20 }} />
            : lugaresCerca.slice(0, 4).map(lu => (
                <RowLugar key={lu.id} item={lu} dist={(lu as any)._dist} />
              ))
          }
        </View>

        {/* 6. SOCIAL PROOF */}
        {actividad.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus amigos están yendo a...</Text>
            </View>
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => router.push(actividad[0].href as any)}
              activeOpacity={0.85}
            >
              <View style={styles.socialAvatars}>
                {actividad.slice(0, 3).map((a, i) => (
                  <View key={a.id} style={[styles.socialAvatar, { backgroundColor: a.color, marginLeft: i === 0 ? 0 : -12, zIndex: 3 - i }]}>
                    <Text style={styles.socialIni}>{a.ini}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.socialEvento} numberOfLines={1}>{actividad[0].nombre}</Text>
                <Text style={styles.socialTexto} numberOfLines={1}>
                  {actividad[0].quien}
                  {actividad.length > 1 ? ` y ${actividad.length - 1} más van` : ' va'} a este plan
                </Text>
              </View>
              <Text style={{ color: T.fg4, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 7. CTA PLANIFICA */}
        <LinearGradient
          colors={[T.purple, '#8E6CFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Planifica con amigos</Text>
            <Text style={styles.ctaSub}>Organiza tu próxima salida y compártela.</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/eventos')} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>Crear plan</Text>
          </TouchableOpacity>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#FFFFFF' },
  headerSub:         { fontSize: F.size.sm, color: T.fg3 },
  avatarBtn:         { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:         { width: 38, height: 38, borderRadius: R.full },
  avatarIni:         { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  notifBtn:          { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  notifBadge:        { position: 'absolute', top: -4, right: -4, backgroundColor: T.orange, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notifBadgeText:    { fontSize: 9, fontWeight: F.weight.bold, color: '#fff' },
  searchRow:         { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.lg, marginTop: S.lg },
  searchBox:         { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.bg, borderRadius: R.xl, paddingHorizontal: S.lg, height: 48 },
  searchPlaceholder: { fontSize: F.size.sm, color: T.fg3, flex: 1 },
  filterBtn:         { width: 48, height: 48, borderRadius: R.xl, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  chips:             { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: 4 },
  chip:              { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.lg, paddingVertical: 10, borderRadius: R.full },
  chipText:          { fontSize: F.size.sm, fontWeight: F.weight.semibold },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.xxl, marginBottom: S.md },
  sectionTitle:      { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.3 },
  sectionAction:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  // Social proof
  socialCard:        { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, backgroundColor: T.surface, borderRadius: R.xl, padding: S.lg, shadowColor: '#15131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  socialAvatars:     { flexDirection: 'row', alignItems: 'center' },
  socialAvatar:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  socialIni:         { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg1 },
  socialEvento:      { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  socialTexto:       { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  // CTA
  ctaCard:           { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.xxl, borderRadius: R.xl, padding: S.xl, shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  ctaTitle:          { fontSize: F.size.xl, fontWeight: F.weight.bold, color: '#fff' },
  ctaSub:            { fontSize: F.size.sm, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  ctaBtn:            { backgroundColor: '#fff', paddingHorizontal: S.xl, paddingVertical: 11, borderRadius: R.full, flexShrink: 0 },
  ctaBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
})

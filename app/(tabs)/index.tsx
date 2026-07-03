import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, Bell, MapPin, Calendar } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'
import { calcIsOpen } from '@/lib/hours'

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

function fechaHoy() {
  return new Date().toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function CardLugar({ item }: { item: Place }) {
  const color = getCatColor(item.category)
  const emoji = getCatEmoji(item.category)
  return (
    <TouchableOpacity style={[styles.card, { borderTopColor: color, borderTopWidth: 3 }]}
      onPress={() => router.push(`/lugares/${item.id}`)}>
      <View style={[styles.cardIcon, { backgroundColor: color + '22' }]}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.cardSub} numberOfLines={1}>{item.category}</Text>
      <View style={styles.cardRow}>
        <View style={[styles.badge, { backgroundColor: calcIsOpen(item.hours, item.is_open) ? T.greenSoft : T.dangerSoft }]}>
          <Text style={[styles.badgeText, { color: calcIsOpen(item.hours, item.is_open) ? T.green : T.danger }]}>
            {calcIsOpen(item.hours, item.is_open) ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function CardEvento({ item }: { item: Event }) {
  const color = getCatColor(item.category)
  const emoji = getCatEmoji(item.category)
  return (
    <TouchableOpacity style={[styles.card, { borderTopColor: T.orange, borderTopWidth: 3 }]}
      onPress={() => router.push(`/eventos/${item.id}`)}>
      <View style={[styles.cardIcon, { backgroundColor: T.orangeSoft }]}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.cardSub} numberOfLines={1}>{formatDate(item.start_datetime)}</Text>
      <View style={styles.cardRow}>
        <View style={[styles.badge, { backgroundColor: item.is_free ? T.greenSoft : T.purpleSoft }]}>
          <Text style={[styles.badgeText, { color: item.is_free ? T.green : T.purple }]}>
            {item.is_free ? 'Gratis' : `Bs. ${item.price}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

function RowEvento({ item }: { item: Event }) {
  const emoji = getCatEmoji(item.category)
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/eventos/${item.id}`)}>
      <View style={[styles.rowIcon, { backgroundColor: T.orangeSoft }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub}>📅 {formatDate(item.start_datetime)}</Text>
        {item.place && <Text style={styles.rowSub} numberOfLines={1}>📍 {item.place.name}</Text>}
      </View>
      <View style={[styles.badge, { backgroundColor: item.is_free ? T.greenSoft : T.purpleSoft }]}>
        <Text style={[styles.badgeText, { color: item.is_free ? T.green : T.purple }]}>
          {item.is_free ? 'Gratis' : `Bs. ${item.price}`}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function RowLugar({ item, dist }: { item: Place; dist?: number }) {
  const emoji = getCatEmoji(item.category)
  const color = getCatColor(item.category)
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/lugares/${item.id}`)}>
      <View style={[styles.rowIcon, { backgroundColor: color + '22' }]}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub}>
          {item.category}{dist != null ? '  ·  📍 ' + formatDist(dist) : ''}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: calcIsOpen(item.hours, item.is_open) ? T.greenSoft : T.muted }]}>
        <Text style={[styles.badgeText, { color: calcIsOpen(item.hours, item.is_open) ? T.green : T.fg3 }]}>
          {calcIsOpen(item.hours, item.is_open) ? 'Abierto' : 'Cerrado'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

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
  const { displayName } = useUser()
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
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
        )
      }

      const results = await Promise.all(baseQueries)
      const [lugRes, evtRes, f1Res, f2Res, notifRes] = results

      if (lugRes?.data) setLugares(lugRes.data)
      if (evtRes?.data) setEventos(evtRes.data as Event[])
      if (notifRes?.count) setSinLeer(notifRes.count)

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
        }, () => setSinLeer(n => n + 1))
        .subscribe()
    })
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  // Geolocation — ask once on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 8000 }
      )
    }
  }, [])

  const lugaresCerca = userCoords
    ? [...lugares]
        .filter(l => l.latitude && l.longitude)
        .map(l => ({ ...l, _dist: haversineKm(userCoords.lat, userCoords.lng, l.latitude!, l.longitude!) }))
        .sort((a, b) => a._dist - b._dist)
        .slice(0, 6)
    : lugares.slice(0, 6)

  const recomendados = [
    ...eventos.slice(0, 2).map(e => ({ type: 'evento' as const, data: e })),
    ...lugares.slice(0, 2).map(l => ({ type: 'lugar' as const, data: l })),
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Image
              source={require('../../assets/logo-trivai.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityRole="header"
              accessibilityLabel="Trivai"
            />
            <Text style={styles.fecha}>{fechaHoy()}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notificaciones')}>
            <Bell size={20} color={sinLeer > 0 ? T.purple : T.fg2} />
            {sinLeer > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{sinLeer > 9 ? '9+' : sinLeer}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SALUDO */}
        <View style={styles.section}>
          <Text style={styles.saludo}>¡Hola, {displayName}!</Text>
          <Text style={styles.subSaludo}>¿Qué planes tienes hoy?</Text>

          {/* BUSCADOR */}
          <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/buscar')}>
            <Search size={16} color={T.fg3} />
            <Text style={styles.searchPlaceholder}>Buscar lugares, eventos...</Text>
          </TouchableOpacity>
        </View>

        {/* CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          <TouchableOpacity style={[styles.chip, { backgroundColor: T.green }]}
            onPress={() => {}}>
            <Text style={[styles.chipText, { color: '#fff' }]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: T.muted }]}
            onPress={() => router.push('/eventos')}>
            <Text style={[styles.chipText, { color: T.fg2 }]}>Eventos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: T.muted }]}
            onPress={() => router.push('/lugares')}>
            <Text style={[styles.chipText, { color: T.fg2 }]}>Lugares</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: T.muted }]}
            onPress={() => router.push('/amigos')}>
            <Text style={[styles.chipText, { color: T.fg2 }]}>Amigos</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* RECOMENDADOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recomendados para ti</Text>
          <TouchableOpacity onPress={() => router.push('/lugares')}>
            <Text style={styles.sectionAction}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {loading
          ? <ActivityIndicator color={T.purple} style={{ marginVertical: 20 }} />
          : (
            <FlatList
              horizontal
              data={recomendados}
              keyExtractor={(_, i) => String(i)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: S.lg, gap: 12, paddingBottom: 4 }}
              renderItem={({ item }) =>
                item.type === 'evento'
                  ? <CardEvento item={item.data as Event} />
                  : <CardLugar item={item.data as Place} />
              }
            />
          )
        }

        {/* EVENTOS PRÓXIMOS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Eventos próximos</Text>
          <TouchableOpacity onPress={() => router.push('/eventos')}>
            <Text style={styles.sectionAction}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: S.lg }}>
          {loading
            ? <ActivityIndicator color={T.purple} />
            : eventos.slice(0, 4).map(ev => <RowEvento key={ev.id} item={ev} />)
          }
        </View>

        {/* CERCA DE TI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cerca de ti</Text>
          <TouchableOpacity onPress={() => router.push('/mapa')}>
            <Text style={styles.sectionAction}>Ver mapa</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: S.lg }}>
          {loading
            ? <ActivityIndicator color={T.purple} />
            : lugaresCerca.slice(0, 4).map(lu => (
                <RowLugar key={lu.id} item={lu} dist={(lu as any)._dist} />
              ))
          }
        </View>

        {/* ACTIVIDAD DE AMIGOS */}
        {actividad.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Actividad de amigos</Text>
              <TouchableOpacity onPress={() => router.push('/amigos')}>
                <Text style={styles.sectionAction}>Ver amigos</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: S.lg }}>
              {actividad.map(a => (
                <TouchableOpacity key={a.id} style={styles.actividadRow} onPress={() => router.push(a.href as any)}>
                  <View style={[styles.actividadAvatar, { backgroundColor: a.color }]}>
                    <Text style={styles.actividadIni}>{a.ini}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actividadTexto}>
                      <Text style={{ fontWeight: F.weight.bold }}>{a.quien} </Text>
                      <Text style={{ color: T.fg2 }}>{a.accion} </Text>
                      <Text style={{ color: T.purple, fontWeight: F.weight.semibold }}>{a.nombre}</Text>
                    </Text>
                  </View>
                  <Text style={{ color: T.fg4, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.lg, paddingVertical: S.md, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  logoImage:         { height: 44, width: 170, alignSelf: 'flex-start', marginBottom: S.xs },
  fecha:             { fontSize: F.size.xs, color: T.fg3, marginTop: 2, textTransform: 'capitalize' },
  notifBtn:          { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' },
  notifBadge:        { position: 'absolute', top: -4, right: -4, backgroundColor: T.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  notifBadgeText:    { fontSize: 9, fontWeight: F.weight.bold, color: '#fff' },
  section:           { padding: S.lg },
  saludo:            { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.5 },
  subSaludo:         { fontSize: F.size.md, color: T.fg2, marginTop: 4, marginBottom: S.md },
  searchBox:         { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, borderRadius: R.lg, paddingHorizontal: S.md, paddingVertical: 12, borderWidth: 1, borderColor: T.border },
  searchPlaceholder: { fontSize: F.size.base, color: T.fg3, flex: 1 },
  chips:             { paddingHorizontal: S.lg, gap: S.sm, paddingBottom: 4 },
  chip:              { paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.full },
  chipText:          { fontSize: F.size.base, fontWeight: F.weight.semibold },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: S.lg, marginTop: S.xl, marginBottom: S.sm },
  sectionTitle:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  card:              { width: 180, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardIcon:          { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  cardEmoji:         { fontSize: 22 },
  cardTitle:         { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: 2 },
  cardSub:           { fontSize: F.size.sm, color: T.fg3, marginBottom: S.sm },
  cardRow:           { flexDirection: 'row' },
  badge:             { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.full },
  badgeText:         { fontSize: F.size.xs, fontWeight: F.weight.semibold },
  row:              { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  rowIcon:          { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowContent:       { flex: 1 },
  rowTitle:         { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  rowSub:           { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  actividadRow:     { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  actividadAvatar:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actividadIni:     { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  actividadTexto:   { fontSize: F.size.sm, color: T.fg1, lineHeight: 18 },
})

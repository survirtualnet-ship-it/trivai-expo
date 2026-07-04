import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  Search, SlidersHorizontal, Ticket,
  UtensilsCrossed, Palette, Trees, Sparkles,
} from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { AppHeader, HeaderLogo } from '@/components/ui/AppHeader'
import { FilterChip } from '@/components/ui/FilterChip'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { HeroCard } from '@/components/ui/HeroCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { PlaceCard, ZoneCard, CategoryChip, type PlaceCardData } from '@/components/ui/PlaceCard'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, groupEventsByBucket, esHoy } from '@/lib/eventUtils'
import { dedupePlaces } from '@/lib/places'

type QuickFilter = 'hoy' | 'cerca' | 'trending' | null

interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

const ZONAS = [
  { nombre: 'Centro',     emoji: '🏛️', bg: T.purpleSoft, fg: T.purpleInk, lat: -17.7833, lng: -63.1821 },
  { nombre: 'Equipetrol', emoji: '🍺', bg: T.orangeSoft, fg: T.orangeInk, lat: -17.7697, lng: -63.2017 },
  { nombre: 'Las Palmas', emoji: '🌳', bg: T.greenSoft,  fg: T.greenInk,  lat: -17.7521, lng: -63.1919 },
  { nombre: 'Urbarí',     emoji: '🖼️', bg: T.muted,      fg: T.fg2,       lat: -17.7992, lng: -63.1734 },
]

const CATEGORIAS = [
  { label: 'Eventos',         Icon: Ticket,          color: T.accent,    bg: T.orangeSoft, go: () => deferredPush('/eventos') },
  { label: 'Gastronomía',     Icon: UtensilsCrossed, color: T.accent,    bg: T.orangeSoft, go: () => deferredPush({ pathname: '/lugares', params: { cat: 'Gastronomía' } }) },
  { label: 'Entretenimiento', Icon: Palette,         color: T.primary,   bg: T.purpleSoft, go: () => deferredPush({ pathname: '/lugares', params: { cat: 'Entretenimiento' } }) },
  { label: 'Parques',         Icon: Trees,           color: T.secondary, bg: T.greenSoft,  go: () => deferredPush({ pathname: '/lugares', params: { cat: 'Parques' } }) },
  { label: 'Otros',           Icon: Sparkles,        color: T.fg2,       bg: T.muted,      go: () => deferredPush({ pathname: '/lugares', params: { cat: 'Otros' } }) },
]

export default function Discover() {
  const { displayName } = useUser()
  const [lugares, setLugares] = useState<PlaceCardData[]>([])
  const [eventos, setEventos] = useState<EventCardData[]>([])
  const [actividad, setActividad] = useState<FriendActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [sinLeer, setSinLeer] = useState(0)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    getCurrentCoords().then(c => { if (c) setUserCoords(c) })

    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      const queries: Promise<any>[] = [
        supabase.from('places')
          .select('id,name,category,address,rating_avg,is_open,hours,latitude,longitude')
          .not('latitude', 'is', null)
          .order('rating_avg', { ascending: false })
          .limit(24),
        supabase.from('events')
          .select('id,name,category,start_datetime,is_free,price,attendees_count,place:places(name,address,latitude,longitude)')
          .eq('is_active', true)
          .gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(40),
      ]

      if (user) {
        queries.push(
          supabase.from('friendships').select('friend_id').eq('user_id', user.id).eq('status', 'accepted'),
          supabase.from('friendships').select('user_id').eq('friend_id', user.id).eq('status', 'accepted'),
          supabase.from('notifications').select('id, type').eq('user_id', user.id).eq('is_read', false),
        )
      }

      const results = await Promise.all(queries)
      const [lugRes, evtRes, f1Res, f2Res, notifRes] = results

      if (lugRes?.data) setLugares(dedupePlaces(lugRes.data))
      if (evtRes?.data) {
        setEventos(evtRes.data.map((e: any) => ({ ...e, attendees_count: e.attendees_count ?? 0 })))
      }

      if (notifRes?.data && user) {
        const prefs = await loadNotifPrefs(user.id)
        setSinLeer((notifRes.data as { type: string }[]).filter(n => prefAllows(prefs, n.type ?? 'system')).length)
      }

      if (user && (f1Res?.data?.length || f2Res?.data?.length)) {
        const friendIds = [...new Set([
          ...(f1Res?.data ?? []).map((f: any) => f.friend_id),
          ...(f2Res?.data ?? []).map((f: any) => f.user_id),
        ])]
        if (friendIds.length) {
          const { data: asistencias } = await supabase
            .from('event_attendees')
            .select('event:events(id,name), profile:profiles(full_name,username)')
            .in('user_id', friendIds)
            .eq('status', 'going')
            .limit(8)
          if (asistencias) {
            setActividad((asistencias as any[])
              .filter(a => a.event?.id && a.profile?.full_name)
              .map((a, i) => ({
                id: `${a.event.id}-${i}`,
                quien: a.profile.full_name.split(' ')[0],
                ini: a.profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
                nombre: a.event.name,
                href: `/eventos/${a.event.id}`,
              })))
          }
        }
      }

      setLoading(false)
    }
    fetch()
  }, [])

  const lugaresConDist = useMemo(() => {
    if (!userCoords) return lugares
    return lugares.map(l => {
      if (l.latitude && l.longitude) {
        return { ...l, _dist: haversineKm(userCoords.lat, userCoords.lng, l.latitude, l.longitude) }
      }
      return l
    })
  }, [lugares, userCoords])

  const eventosConDist = useMemo(() => {
    if (!userCoords) return eventos
    return eventos.map(ev => {
      const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude && pl?.longitude) {
        return { ...ev, _dist: haversineKm(userCoords.lat, userCoords.lng, pl.latitude, pl.longitude) }
      }
      return ev
    })
  }, [eventos, userCoords])

  const filteredEvents = useMemo(() => {
    let list = [...eventosConDist]
    if (quickFilter === 'hoy') list = list.filter(e => esHoy(e.start_datetime))
    if (quickFilter === 'cerca') list = [...list].filter(e => e._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    if (quickFilter === 'trending') list = [...list].sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0))
    return list
  }, [eventosConDist, quickFilter])

  const lugaresCerca = useMemo(() => {
    let list = [...lugaresConDist]
    if (quickFilter === 'cerca' && userCoords) {
      list = list.filter(l => l._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    } else {
      list = list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
    }
    return list.slice(0, 6)
  }, [lugaresConDist, quickFilter, userCoords])

  const destacados = useMemo(() => {
    let list = [...filteredEvents]
    // Sin filtro o "Hoy": entre los resultados, ordenar por popularidad
    if (quickFilter === null || quickFilter === 'hoy') {
      list.sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0))
    }
    return list.slice(0, 8)
  }, [filteredEvents, quickFilter])

  const hero = destacados[0] ?? null
  const { noche, manana, finde } = groupEventsByBucket(filteredEvents)
  const toggleQuick = (f: QuickFilter) => setQuickFilter(prev => (prev === f ? null : f))

  const showEventSections = quickFilter !== 'cerca' || filteredEvents.length > 0
  const emphasizePlaces = quickFilter === 'cerca'

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <AppHeader
          greeting={`Hola, ${displayName}`}
          subtitle="¿Qué te apetece hoy?"
          left={<HeaderLogo onPress={() => deferredPush('/')} />}
          onNotifPress={() => deferredPush('/notificaciones')}
          notifCount={sinLeer}
        />

        <TouchableOpacity style={styles.search} onPress={() => deferredPush('/buscar')} activeOpacity={0.85}>
          <Search size={18} color={T.fg3} />
          <Text style={styles.searchPh}>Buscar eventos, lugares...</Text>
          <SlidersHorizontal size={18} color={T.primary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="Hoy" active={quickFilter === 'hoy'} onPress={() => toggleQuick('hoy')} />
          <FilterChip label="Cerca" active={quickFilter === 'cerca'} onPress={() => toggleQuick('cerca')} accent={T.secondary} />
          <FilterChip label="Destacados" active={quickFilter === 'trending'} onPress={() => toggleQuick('trending')} accent={T.accent} />
        </ScrollView>

        {/* Categorías — lugares + eventos */}
        <SectionHeader title="Explorar por tipo" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIAS.map(c => (
            <CategoryChip key={c.label} label={c.label} Icon={c.Icon} color={c.color} bg={c.bg} onPress={c.go} />
          ))}
        </ScrollView>

        {/* Zonas de Santa Cruz */}
        <SectionHeader title="Explorar por zona" actionLabel="Ver mapa" onAction={() => deferredPush('/mapa')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {ZONAS.map(z => (
            <ZoneCard
              key={z.nombre}
              nombre={z.nombre}
              emoji={z.emoji}
              bg={z.bg}
              fg={z.fg}
              onPress={() => deferredPush({ pathname: '/mapa', params: { lat: String(z.lat), lng: String(z.lng), zona: z.nombre } })}
            />
          ))}
        </ScrollView>

        {/* CTA social */}
        <LinearGradient colors={[T.primary, '#8E6CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Planifica con amigos</Text>
            <Text style={styles.ctaSub}>Organiza tu próxima salida y compártela.</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => deferredPush('/publicar')} activeOpacity={0.9}>
            <Text style={styles.ctaBtnText}>Crear plan</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Lugares cerca — priorizado si filtro Cerca */}
        {(emphasizePlaces || !loading) && lugaresCerca.length > 0 && (
          <>
            <SectionHeader
              title={emphasizePlaces ? 'Lugares cerca de ti' : 'Cerca de ti'}
              actionLabel="Ver todos"
              onAction={() => deferredPush('/lugares')}
            />
            <View style={styles.list}>
              {loading
                ? <ActivityIndicator color={T.primary} style={{ marginVertical: S.lg }} />
                : lugaresCerca.slice(0, emphasizePlaces ? 6 : 4).map(lu => (
                    <PlaceCard
                      key={lu.id}
                      place={lu}
                      onPress={() => deferredPush(`/lugares/${lu.id}`)}
                    />
                  ))}
            </View>
          </>
        )}

        {/* Eventos trending */}
        {showEventSections && (
          <>
            <SectionHeader title="Más Destacados" actionLabel="Eventos" onAction={() => deferredPush('/eventos')} />
            {loading ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                <SkeletonCard /><SkeletonCard />
              </ScrollView>
            ) : (
              <FlatList
                horizontal
                data={destacados}
                keyExtractor={e => e.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <EventCard event={item} variant="horizontal" onPress={() => deferredPush(`/eventos/${item.id}`)} />
                )}
                ListEmptyComponent={<Text style={styles.emptyHint}>No hay eventos destacados</Text>}
              />
            )}
          </>
        )}

        {actividad.length > 0 && (
          <>
            <SectionHeader title="Actividad de amigos" actionLabel="Ver más" onAction={() => deferredPush('/amigos')} />
            <TouchableOpacity style={styles.friendCard} onPress={() => deferredPush(actividad[0].href as any)} activeOpacity={0.9}>
              <AvatarGroup items={actividad.slice(0, 4).map(a => ({ id: a.id, initials: a.ini }))} max={4} size={36} />
              <View style={styles.friendBody}>
                <Text style={styles.friendTitle} numberOfLines={1}>{actividad[0].nombre}</Text>
                <Text style={styles.friendSub} numberOfLines={1}>
                  {actividad[0].quien}{actividad.length > 1 ? ` y ${actividad.length - 1} más van` : ' va'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {hero && !loading && showEventSections && (
          <>
            <SectionHeader title="Experiencia destacada" />
            <View style={styles.heroWrap}>
              <HeroCard event={hero} badge="Trending" onPress={() => deferredPush(`/eventos/${hero.id}`)} />
            </View>
          </>
        )}

        {noche.length > 0 && (
          <>
            <SectionHeader title="Esta noche" />
            <View style={styles.list}>
              {noche.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {manana.length > 0 && (
          <>
            <SectionHeader title="Mañana" />
            <View style={styles.list}>
              {manana.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {finde.length > 0 && (
          <>
            <SectionHeader title="Este fin de semana" />
            <View style={styles.list}>
              {finde.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {!loading && filteredEvents.length === 0 && lugaresCerca.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>Sin resultados para este filtro</Text>
            <TouchableOpacity onPress={() => setQuickFilter(null)}>
              <Text style={styles.emptyLink}>Ver todo</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: S.xxxl },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    marginHorizontal: S.lg, marginTop: S.sm,
    backgroundColor: T.surface, borderRadius: R.xl,
    paddingHorizontal: S.lg, height: 52, ...SHADOW.sm,
  },
  searchPh: { flex: 1, fontFamily: FONT.regular, fontSize: F.size.md, color: T.fg3 },
  filters: { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: S.xs },
  chips: { paddingHorizontal: S.lg, gap: S.sm, paddingBottom: S.xs },
  hList: { paddingHorizontal: S.lg, gap: S.md, paddingBottom: 4 },
  heroWrap: { paddingHorizontal: S.lg },
  list: { paddingHorizontal: S.lg, gap: S.md },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    marginHorizontal: S.lg, marginTop: S.lg, marginBottom: S.sm,
    borderRadius: R.xl, padding: S.xl, ...SHADOW.lg,
  },
  ctaTitle: { fontFamily: FONT.bold, fontSize: F.size.xl, fontWeight: F.weight.bold, color: '#fff' },
  ctaSub: { fontFamily: FONT.regular, fontSize: F.size.sm, color: 'rgba(255,255,255,0.88)', marginTop: 3 },
  ctaBtn: { backgroundColor: '#fff', paddingHorizontal: S.xl, paddingVertical: 11, borderRadius: R.full },
  ctaBtnText: { fontFamily: FONT.bold, fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.primary },
  friendCard: {
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    marginHorizontal: S.lg, backgroundColor: T.surface,
    borderRadius: R.xl, padding: S.lg, ...SHADOW.md,
  },
  friendBody: { flex: 1, minWidth: 0 },
  friendTitle: { fontFamily: FONT.bold, fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  friendSub: { fontFamily: FONT.regular, fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  emptyHint: { fontFamily: FONT.regular, fontSize: F.size.sm, color: T.fg3, paddingHorizontal: S.lg },
  emptyWrap: { alignItems: 'center', paddingTop: S.xxxl, gap: S.sm },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: FONT.bold, fontSize: F.size.lg, color: T.fg1 },
  emptyLink: { fontFamily: FONT.semibold, fontSize: F.size.md, color: T.primary },
})

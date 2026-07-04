import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { UtensilsCrossed, Palette, Trees, Sparkles } from 'lucide-react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { useLocale } from '@/hooks/useLocale'
import { useDiscoverSearch } from '@/hooks/useDiscoverSearch'
import { T, F, S, R, SHADOW, normalizeCategory } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import type { Category } from '@/lib/categories'
import { getCityZone, CITY_ZONES, type CityZone } from '@/lib/zones'
import { DiscoverHeader } from '@/components/ui/DiscoverHeader'
import { DiscoverSearchBar } from '@/components/ui/DiscoverSearchBar'
import { FilterChip } from '@/components/ui/FilterChip'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { HeroCard } from '@/components/ui/HeroCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { PlaceCard, CategoryChip, type PlaceCardData } from '@/components/ui/PlaceCard'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, groupEventsByBucket, esHoy } from '@/lib/eventUtils'
import { dedupePlaces } from '@/lib/places'
import { DISCOVER_STRINGS } from '@/lib/i18n/discover'
import {
  buildSearchSuggestions,
  mergeSearchEvents,
  mergeSearchPlaces,
  matchesSearch,
} from '@/lib/smartSearch'

type LocationFilter = 'hoy' | 'cerca' | CityZone
type CategoryFilter = Category | 'Todos'

interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

const CATEGORIAS: {
  label: Category
  Icon: typeof UtensilsCrossed
  color: string
  bg: string
}[] = [
  { label: 'Gastronomía',     Icon: UtensilsCrossed, color: T.accent,    bg: T.orangeSoft },
  { label: 'Entretenimiento', Icon: Palette,         color: T.primary,   bg: T.purpleSoft },
  { label: 'Parques',         Icon: Trees,           color: T.secondary, bg: T.greenSoft },
  { label: 'Otros',           Icon: Sparkles,        color: T.fg2,       bg: T.muted },
]

function placeInZone(place: PlaceCardData, zone: CityZone): boolean {
  if (place.latitude == null || place.longitude == null) return false
  return getCityZone(place.latitude, place.longitude) === zone
}

function eventInZone(event: EventCardData, zone: CityZone): boolean {
  const pl = event.place as EventCardData['place'] & { latitude?: number; longitude?: number }
  if (pl?.latitude == null || pl?.longitude == null) return false
  return getCityZone(pl.latitude, pl.longitude) === zone
}

export default function Discover() {
  const { profile, isAuthenticated, signOut } = useUser()
  const { locale, setLocale } = useLocale()
  const t = DISCOVER_STRINGS[locale]
  const cityName = profile?.city ?? 'Santa Cruz de la Sierra'

  const [lugares, setLugares] = useState<PlaceCardData[]>([])
  const [eventos, setEventos] = useState<EventCardData[]>([])
  const [actividad, setActividad] = useState<FriendActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [sinLeer, setSinLeer] = useState(0)
  const [locationFilter, setLocationFilter] = useState<LocationFilter | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todos')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    remoteLugares,
    remoteEventos,
    personas,
    searching,
    isActive: isSearchActive,
  } = useDiscoverSearch(searchQuery)

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

  const lugaresForView = useMemo(
    () => mergeSearchPlaces(lugares, remoteLugares, searchQuery),
    [lugares, remoteLugares, searchQuery],
  )

  const eventosForView = useMemo(
    () => mergeSearchEvents(eventos, remoteEventos, searchQuery),
    [eventos, remoteEventos, searchQuery],
  )

  const actividadForView = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return actividad
    return actividad.filter(a =>
      matchesSearch(a.nombre, q) || matchesSearch(a.quien, q),
    )
  }, [actividad, searchQuery])

  const lugaresConDist = useMemo(() => {
    if (!userCoords) return lugaresForView
    return lugaresForView.map(l => {
      if (l.latitude && l.longitude) {
        return { ...l, _dist: haversineKm(userCoords.lat, userCoords.lng, l.latitude, l.longitude) }
      }
      return l
    })
  }, [lugaresForView, userCoords])

  const eventosConDist = useMemo(() => {
    if (!userCoords) return eventosForView
    return eventosForView.map(ev => {
      const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude && pl?.longitude) {
        return { ...ev, _dist: haversineKm(userCoords.lat, userCoords.lng, pl.latitude, pl.longitude) }
      }
      return ev
    })
  }, [eventosForView, userCoords])

  const searchSuggestions = useMemo(
    () => buildSearchSuggestions(lugaresForView, eventosForView, personas, searchQuery),
    [lugaresForView, eventosForView, personas, searchQuery],
  )

  const { filteredPlaces, filteredEvents } = useMemo(() => {
    let places = [...lugaresConDist]
    let events = [...eventosConDist]

    if (categoryFilter !== 'Todos') {
      places = places.filter(p => normalizeCategory(p.category) === categoryFilter)
      events = events.filter(e => normalizeCategory(e.category) === categoryFilter)
    }

    if (locationFilter === 'hoy') {
      events = events.filter(e => esHoy(e.start_datetime))
      if (categoryFilter === 'Entretenimiento') {
        places = []
      }
    } else if (locationFilter === 'cerca' && userCoords) {
      places = places
        .filter(p => p._dist != null)
        .sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
      events = events
        .filter(e => e._dist != null)
        .sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    } else if (locationFilter != null && locationFilter !== 'hoy' && locationFilter !== 'cerca') {
      places = places.filter(p => placeInZone(p, locationFilter))
      events = events.filter(e => eventInZone(e, locationFilter))
    }

    return { filteredPlaces: places, filteredEvents: events }
  }, [lugaresConDist, eventosConDist, categoryFilter, locationFilter, userCoords])

  const lugaresCerca = useMemo(() => {
    let list = [...filteredPlaces]
    if (locationFilter !== 'cerca') {
      list = list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
    }
    return list.slice(0, 6)
  }, [filteredPlaces, locationFilter])

  const destacados = useMemo(() => {
    const list = [...filteredEvents].sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0))
    return list.slice(0, 8)
  }, [filteredEvents])

  const hero = destacados[0] ?? null
  const { noche, manana, finde } = groupEventsByBucket(filteredEvents)

  const selectLocation = (f: LocationFilter) =>
    setLocationFilter(prev => (prev === f ? null : f))

  const isFilterMode = locationFilter != null || categoryFilter !== 'Todos' || isSearchActive
  const showBrowseSections = !isFilterMode
  const showEventSections = locationFilter !== 'cerca' || filteredEvents.length > 0
  const emphasizePlaces = locationFilter === 'cerca'

  const locationFilterLabel = useMemo(() => {
    if (locationFilter == null) return null
    if (locationFilter === 'hoy') return t.filterHoy
    if (locationFilter === 'cerca') return t.filterCerca
    return locationFilter
  }, [locationFilter, t])

  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (locationFilterLabel) parts.push(locationFilterLabel)
    if (categoryFilter !== 'Todos') parts.push(categoryFilter)
    return parts.join(' · ')
  }, [locationFilterLabel, categoryFilter])

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >

        <DiscoverHeader
          cityName={cityName}
          locale={locale}
          isAuthenticated={isAuthenticated}
          notifCount={sinLeer}
          onLocaleChange={setLocale}
          onSignIn={() => deferredPush('/auth')}
          onSignOut={handleSignOut}
          onNotifPress={() => deferredPush('/notificaciones')}
        />

        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchPlaceholder}
          suggestions={searchSuggestions}
          searching={searching}
          showSuggestions
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label={t.filterHoy} active={locationFilter === 'hoy'} onPress={() => selectLocation('hoy')} />
          <FilterChip label={t.filterCerca} active={locationFilter === 'cerca'} onPress={() => selectLocation('cerca')} accent={T.secondary} />
          {CITY_ZONES.map(z => (
            <FilterChip key={z} label={z} active={locationFilter === z} onPress={() => selectLocation(z)} />
          ))}
        </ScrollView>

        <SectionHeader title="Explorar por tipo" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip
            label={t.filterTodos}
            active={categoryFilter === 'Todos'}
            onPress={() => setCategoryFilter('Todos')}
          />
          {CATEGORIAS.map(c => (
            <CategoryChip
              key={c.label}
              label={c.label}
              Icon={c.Icon}
              color={c.color}
              bg={c.bg}
              active={categoryFilter === c.label}
              onPress={() => setCategoryFilter(c.label)}
            />
          ))}
        </ScrollView>

        {showBrowseSections && (
          <>
            <LinearGradient colors={[T.primary, '#8E6CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaTitle}>Planifica con amigos</Text>
                <Text style={styles.ctaSub}>Organiza tu próxima salida y compártela.</Text>
              </View>
              <TouchableOpacity style={styles.ctaBtn} onPress={() => deferredPush('/publicar')} activeOpacity={0.9}>
                <Text style={styles.ctaBtnText}>Crear plan</Text>
              </TouchableOpacity>
            </LinearGradient>
          </>
        )}

        {isSearchActive && (
          <SectionHeader title={`Resultados · "${searchQuery.trim()}"`} />
        )}

        {isFilterMode && (
          <SectionHeader title={filterSummary || 'Resultados'} />
        )}

        {(isFilterMode || isSearchActive) && filteredPlaces.length > 0 && (
          <>
            <SectionHeader title="Lugares" actionLabel={t.seeAll} onAction={() => deferredPush('/lugares')} />
            <View style={styles.list}>
              {filteredPlaces.map(lu => (
                <PlaceCard
                  key={lu.id}
                  place={lu}
                  locale={locale}
                  onPress={() => deferredPush(`/lugares/${lu.id}`)}
                />
              ))}
            </View>
          </>
        )}

        {(isFilterMode || isSearchActive) && filteredEvents.length > 0 && (
          <>
            <SectionHeader title="Eventos" />
            <View style={styles.list}>
              {filteredEvents.map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {showBrowseSections && (emphasizePlaces || !loading) && lugaresCerca.length > 0 && (
          <>
            <SectionHeader
              title={emphasizePlaces ? 'Lugares cerca de ti' : 'Cerca de ti'}
              actionLabel={t.seeAll}
              onAction={() => deferredPush('/lugares')}
            />
            <View style={styles.list}>
              {loading
                ? <ActivityIndicator color={T.primary} style={{ marginVertical: S.lg }} />
                : lugaresCerca.slice(0, emphasizePlaces ? 6 : 4).map(lu => (
                    <PlaceCard
                      key={lu.id}
                      place={lu}
                      locale={locale}
                      onPress={() => deferredPush(`/lugares/${lu.id}`)}
                    />
                  ))}
            </View>
          </>
        )}

        {showBrowseSections && showEventSections && (
          <>
            <SectionHeader title="Más Destacados" />
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

        {isSearchActive && personas.length > 0 && (
          <>
            <SectionHeader title="Personas" />
            <View style={styles.list}>
              {personas.slice(0, 6).map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.personRow}
                  onPress={() => deferredPush(`/perfil/${p.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={styles.personAvatar}>
                    <Text style={styles.personIni}>{p.ini}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendTitle} numberOfLines={1}>{p.nombre}</Text>
                    {p.usuario ? <Text style={styles.friendSub}>@{p.usuario}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {showBrowseSections && actividadForView.length > 0 && (
          <>
            <SectionHeader title="Actividad de amigos" actionLabel="Ver más" onAction={() => deferredPush('/amigos')} />
            <TouchableOpacity style={styles.friendCard} onPress={() => deferredPush(actividadForView[0].href as any)} activeOpacity={0.9}>
              <AvatarGroup items={actividadForView.slice(0, 4).map(a => ({ id: a.id, initials: a.ini }))} max={4} size={36} />
              <View style={styles.friendBody}>
                <Text style={styles.friendTitle} numberOfLines={1}>{actividadForView[0].nombre}</Text>
                <Text style={styles.friendSub} numberOfLines={1}>
                  {actividadForView[0].quien}{actividadForView.length > 1 ? ` y ${actividadForView.length - 1} más van` : ' va'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {showBrowseSections && hero && !loading && showEventSections && (
          <>
            <SectionHeader title="Experiencia destacada" />
            <View style={styles.heroWrap}>
              <HeroCard event={hero} badge="Destacado" onPress={() => deferredPush(`/eventos/${hero.id}`)} />
            </View>
          </>
        )}

        {showBrowseSections && noche.length > 0 && (
          <>
            <SectionHeader title="Esta noche" />
            <View style={styles.list}>
              {noche.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {showBrowseSections && manana.length > 0 && (
          <>
            <SectionHeader title="Mañana" />
            <View style={styles.list}>
              {manana.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {showBrowseSections && finde.length > 0 && (
          <>
            <SectionHeader title="Este fin de semana" />
            <View style={styles.list}>
              {finde.slice(0, 4).map(ev => (
                <EventCard key={ev.id} event={ev} variant="list" onPress={() => deferredPush(`/eventos/${ev.id}`)} />
              ))}
            </View>
          </>
        )}

        {!loading && !searching && (isSearchActive || isFilterMode) &&
          filteredEvents.length === 0 && filteredPlaces.length === 0 && personas.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{isSearchActive || isFilterMode ? '🔍' : '✨'}</Text>
            <Text style={styles.emptyTitle}>{t.noResults}</Text>
            <TouchableOpacity onPress={() => {
              setLocationFilter(null)
              setCategoryFilter('Todos')
              setSearchQuery('')
            }}>
              <Text style={styles.emptyLink}>{t.seeAllLink}</Text>
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
  filters: { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: S.xs },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.md,
    ...SHADOW.sm,
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personIni: {
    fontFamily: FONT.bold,
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.primary,
  },
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

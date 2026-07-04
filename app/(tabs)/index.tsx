import { useState, useEffect, useMemo, useTransition, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { useLocale } from '@/hooks/useLocale'
import { useDiscoverSearch } from '@/hooks/useDiscoverSearch'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import {
  applyDiscoverFilters,
  enrichEventsWithZone,
  enrichPlacesWithZone,
  type CategoryFilter,
  type LocationFilter,
} from '@/lib/discoverFilters'
import { DiscoverHeader } from '@/components/ui/DiscoverHeader'
import { DiscoverSearchBar } from '@/components/ui/DiscoverSearchBar'
import { DiscoverFilterBar } from '@/components/discover/DiscoverFilterBar'
import { DiscoverCarouselCard } from '@/components/discover/DiscoverCarouselCard'
import { DiscoverCarouselSection } from '@/components/discover/DiscoverCarouselSection'
import { HeroCard } from '@/components/ui/HeroCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'
import {
  firstPhoto,
  placeBadge,
  eventBadge,
  minutesLabel,
  zoneLabel,
} from '@/lib/discoverCardUtils'
import {
  buildCercaDeTi,
  buildMasDestacados,
  topFeaturedEvent,
  suggestionKey,
  type DiscoverSuggestion,
} from '@/lib/discoverSuggestions'
import { haversineKm, groupEventsByBucket, formatEventDateShort } from '@/lib/eventUtils'
import { calcIsOpen } from '@/lib/hours'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { deferredPush } from '@/lib/deferredNav'
import { dedupePlaces } from '@/lib/places'
import { DISCOVER_STRINGS } from '@/lib/i18n/discover'
import {
  buildSearchSuggestions,
  mergeSearchEvents,
  mergeSearchPlaces,
  matchesSearch,
} from '@/lib/smartSearch'

interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

const SC_CENTER = { lat: -17.7833, lng: -63.1821 }

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
  const [appliedLocationFilter, setAppliedLocationFilter] = useState<LocationFilter | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todos')
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<CategoryFilter>('Todos')
  const [isFilterPending, startFilterTransition] = useTransition()
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
          .select('id,name,category,address,rating_avg,is_open,hours,latitude,longitude,photos')
          .not('latitude', 'is', null)
          .order('rating_avg', { ascending: false })
          .limit(64),
        supabase.from('events')
          .select('id,name,category,start_datetime,is_free,price,attendees_count,photos,place:places(name,address,latitude,longitude)')
          .eq('is_active', true)
          .gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(64),
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

  const distOrigin = userCoords ?? SC_CENTER

  const lugaresConDist = useMemo(() => {
    return lugaresForView.map(l => {
      if (l.latitude && l.longitude) {
        return { ...l, _dist: haversineKm(distOrigin.lat, distOrigin.lng, l.latitude, l.longitude) }
      }
      return l
    })
  }, [lugaresForView, distOrigin])

  const eventosConDist = useMemo(() => {
    return eventosForView.map(ev => {
      const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude && pl?.longitude) {
        return { ...ev, _dist: haversineKm(distOrigin.lat, distOrigin.lng, pl.latitude, pl.longitude) }
      }
      return ev
    })
  }, [eventosForView, distOrigin])

  const searchSuggestions = useMemo(
    () => buildSearchSuggestions(lugaresForView, eventosForView, personas, searchQuery),
    [lugaresForView, eventosForView, personas, searchQuery],
  )

  const lugaresEnriched = useMemo(
    () => enrichPlacesWithZone(lugaresConDist),
    [lugaresConDist],
  )

  const eventosEnriched = useMemo(
    () => enrichEventsWithZone(eventosConDist),
    [eventosConDist],
  )

  const { filteredPlaces, filteredEvents } = useMemo(
    () => applyDiscoverFilters(
      lugaresEnriched,
      eventosEnriched,
      appliedCategoryFilter,
      appliedLocationFilter,
      userCoords != null,
    ),
    [lugaresEnriched, eventosEnriched, appliedCategoryFilter, appliedLocationFilter, userCoords],
  )

  const cercaDeTi = useMemo(
    () => buildCercaDeTi(lugaresEnriched, eventosEnriched),
    [lugaresEnriched, eventosEnriched],
  )

  const masDestacados = useMemo(
    () => buildMasDestacados(lugaresEnriched, eventosEnriched),
    [lugaresEnriched, eventosEnriched],
  )

  const hero = useMemo(() => topFeaturedEvent(eventosEnriched), [eventosEnriched])

  const carouselDestacados = useMemo(() => {
    if (!hero) return masDestacados
    return masDestacados.filter(s => !(s.kind === 'event' && s.data.id === hero.id))
  }, [masDestacados, hero])

  const { noche, manana, finde } = groupEventsByBucket(filteredEvents)

  const selectLocation = useCallback((f: LocationFilter) => {
    const next = locationFilter === f ? null : f
    setLocationFilter(next)
    startFilterTransition(() => setAppliedLocationFilter(next))
  }, [locationFilter])

  const selectCategory = useCallback((cat: CategoryFilter) => {
    setCategoryFilter(cat)
    startFilterTransition(() => setAppliedCategoryFilter(cat))
  }, [])

  const clearFilters = useCallback(() => {
    setLocationFilter(null)
    setCategoryFilter('Todos')
    setSearchQuery('')
    startFilterTransition(() => {
      setAppliedLocationFilter(null)
      setAppliedCategoryFilter('Todos')
    })
  }, [])

  const isFilterMode = appliedLocationFilter != null || appliedCategoryFilter !== 'Todos' || isSearchActive
  const showBrowseSections = !isFilterMode
  const showEventSections = appliedLocationFilter !== 'cerca' || filteredEvents.length > 0

  const locationFilterLabel = useMemo(() => {
    if (appliedLocationFilter == null) return null
    if (appliedLocationFilter === 'hoy') return t.filterHoy
    if (appliedLocationFilter === 'cerca') return t.filterCerca
    return appliedLocationFilter
  }, [appliedLocationFilter, t])

  const filterSummary = useMemo(() => {
    const parts: string[] = []
    if (locationFilterLabel) parts.push(locationFilterLabel)
    if (appliedCategoryFilter !== 'Todos') parts.push(appliedCategoryFilter)
    return parts.join(' · ')
  }, [locationFilterLabel, appliedCategoryFilter])

  const renderPlaceCarouselCard = (lu: PlaceCardData, key?: string) => (
    <DiscoverCarouselCard
      key={key ?? lu.id}
      title={lu.name}
      category={lu.category}
      locale={locale}
      photoUri={firstPhoto(lu.photos)}
      rating={lu.rating_avg ?? null}
      minutes={minutesLabel(lu, locale)}
      zone={zoneLabel(lu._zone, locale)}
      isOpen={calcIsOpen(lu.hours, lu.is_open ?? false)}
      badge={placeBadge(lu)}
      onPress={() => deferredPush(`/lugares/${lu.id}`)}
    />
  )

  const renderEventCarouselCard = (ev: EventCardData & { _zone?: string | null }, key?: string) => (
    <DiscoverCarouselCard
      key={key ?? ev.id}
      title={ev.name}
      category={ev.category}
      locale={locale}
      photoUri={firstPhoto(ev.photos)}
      minutes={formatEventDateShort(ev.start_datetime)}
      zone={zoneLabel(ev._zone, locale)}
      isOpen={null}
      badge={eventBadge(ev)}
      onPress={() => deferredPush(`/eventos/${ev.id}`)}
    />
  )

  const renderSuggestionCard = (s: DiscoverSuggestion) => {
    const key = suggestionKey(s)
    return s.kind === 'place'
      ? renderPlaceCarouselCard(s.data, key)
      : renderEventCarouselCard(s.data, key)
  }

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
        nestedScrollEnabled
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

        <DiscoverFilterBar
          t={t}
          locationFilter={locationFilter}
          categoryFilter={categoryFilter}
          onSelectLocation={selectLocation}
          onSelectCategory={selectCategory}
        />

        {isFilterPending && (
          <View style={styles.pendingRow}>
            <ActivityIndicator size="small" color={T.primary} />
          </View>
        )}

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

        {(isFilterMode || isSearchActive) && !isFilterPending && filteredPlaces.length > 0 && (
          <DiscoverCarouselSection title="Lugares">
            {filteredPlaces.map(renderPlaceCarouselCard)}
          </DiscoverCarouselSection>
        )}

        {(isFilterMode || isSearchActive) && !isFilterPending && filteredEvents.length > 0 && (
          <DiscoverCarouselSection title="Eventos">
            {filteredEvents.map(renderEventCarouselCard)}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && !loading && cercaDeTi.length > 0 && (
          <DiscoverCarouselSection title="Cerca de ti" loading={loading}>
            {cercaDeTi.map(renderSuggestionCard)}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && showEventSections && carouselDestacados.length > 0 && (
          <DiscoverCarouselSection title="Más Destacados" loading={loading}>
            {carouselDestacados.map(renderSuggestionCard)}
          </DiscoverCarouselSection>
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
          <DiscoverCarouselSection title="Esta noche">
            {noche.slice(0, 8).map(renderEventCarouselCard)}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && manana.length > 0 && (
          <DiscoverCarouselSection title="Mañana">
            {manana.slice(0, 8).map(renderEventCarouselCard)}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && finde.length > 0 && (
          <DiscoverCarouselSection title="Este fin de semana">
            {finde.slice(0, 8).map(renderEventCarouselCard)}
          </DiscoverCarouselSection>
        )}

        {!loading && !searching && !isFilterPending && (isSearchActive || isFilterMode) &&
          filteredEvents.length === 0 && filteredPlaces.length === 0 && personas.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{isSearchActive || isFilterMode ? '🔍' : '✨'}</Text>
            <Text style={styles.emptyTitle}>{t.noResults}</Text>
            <TouchableOpacity onPress={clearFilters}>
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
  pendingRow: { height: 20, alignItems: 'center', justifyContent: 'center' },
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

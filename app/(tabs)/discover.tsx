import { useState, useEffect, useMemo, useTransition, useCallback, useDeferredValue, useRef, type ReactNode } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Keyboard,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { useUser } from '@/hooks/useUser'
import { useDiscover, DISCOVER_PREFETCH_SCROLL_RATIO } from '@/hooks/useDiscover'
import { useLocale } from '@/hooks/useLocale'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import {
  applyDiscoverFilters,
  enrichAllEvents,
  enrichAllPlaces,
  enrichEventsWithZone,
  enrichPlacesWithZone,
  type CategoryFilter,
  type LocationFilter,
} from '@/lib/discoverFilters'
import { UNKNOWN_CITY_EN, UNKNOWN_CITY_ES } from '@/lib/constants'
import { DiscoverHeader } from '@/components/ui/DiscoverHeader'
import { DiscoverSearchBar } from '@/components/ui/DiscoverSearchBar'
import { DiscoverFilterBar } from '@/components/discover/DiscoverFilterBar'
import { DiscoverCarouselCard, DISCOVER_CAROUSEL_W } from '@/components/discover/DiscoverCarouselCard'
import { DiscoverCarouselSection } from '@/components/discover/DiscoverCarouselSection'
import { DiscoverCarouselSkeleton } from '@/components/discover/DiscoverCarouselCard'
import { DiscoverHeroSkeleton } from '@/components/discover/DiscoverHeroSkeleton'
import { HeroCard } from '@/components/ui/HeroCard'
import { SectionHeader } from '@/components/ui/Section'
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
import { groupEventsByBucket, formatEventDateShort } from '@/lib/eventUtils'
import { calcIsOpen } from '@/lib/hours'
import { deferredPush } from '@/lib/deferredNav'
import { logPlaceView } from '@/lib/userActivity'
import { FadeInView, discoverItemEnterDelay } from '@/components/ui/FadeInView'
import OnboardingModal from '@/components/OnboardingModal'
import { DISCOVER_STRINGS } from '@/lib/i18n/discover'
import { parseDiscoverRouteType } from '@/lib/discoverFeedType'

import {
  buildSearchSuggestions,
  mergeSearchEvents,
  mergeSearchPlaces,
  matchesSearch,
} from '@/lib/smartSearch'
const FILTER_RESULTS_CAP = 32

export default function Discover() {
  const { type: typeParam, location: locationParam } = useLocalSearchParams<{
    type?: string
    location?: string
  }>()
  const routeType = parseDiscoverRouteType(typeParam)
  const { profile, user, isAuthenticated, signOut, isOnboarded, refreshProfile, dismissOnboarding } = useUser()
  const { locale, setLocale } = useLocale()
  const t = DISCOVER_STRINGS[locale]
  const cityName = profile?.city?.trim() || (locale === 'en' ? UNKNOWN_CITY_EN : UNKNOWN_CITY_ES)

  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const {
    lugares,
    eventos,
    actividad,
    sinLeer,
    userCoords,
    remoteLugares,
    remoteEventos,
    personas,
    searching,
    isSearchActive,
    loading,
    isError,
    refetch,
    prefetchNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscover({ searchQuery, type: routeType, mode: 'feed' })

  const [locationFilter, setLocationFilter] = useState<LocationFilter | null>(
    locationParam === 'cerca' ? 'cerca' : null,
  )
  const [appliedLocationFilter, setAppliedLocationFilter] = useState<LocationFilter | null>(
    locationParam === 'cerca' ? 'cerca' : null,
  )
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todos')
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState<CategoryFilter>('Todos')
  const [isFilterPending, startFilterTransition] = useTransition()
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false)
  const seenCarouselIdsRef = useRef(new Set<string>())

  useEffect(() => {
    if (!profile || !isAuthenticated) return
    if (!isOnboarded) setMostrarOnboarding(true)
  }, [profile, isAuthenticated, isOnboarded])

  useEffect(() => {
    if (locationParam !== 'cerca') return
    setLocationFilter('cerca')
    setAppliedLocationFilter('cerca')
  }, [locationParam])

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text)
  }, [])

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const scrollableHeight = contentSize.height - layoutMeasurement.height
    if (scrollableHeight <= 0) return

    const scrollProgress = contentOffset.y / scrollableHeight

    if (scrollProgress >= DISCOVER_PREFETCH_SCROLL_RATIO) {
      prefetchNextPage()
    }

    if (!hasNextPage || isFetchingNextPage) return
    const distanceFromBottom = scrollableHeight - contentOffset.y
    if (distanceFromBottom < 480) fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, prefetchNextPage])

  const distOrigin = useMemo(() => {
    if (userCoords) return userCoords
    const first = lugares.find(p => p.latitude != null && p.longitude != null)
    if (first?.latitude != null && first?.longitude != null) {
      return { lat: first.latitude, lng: first.longitude }
    }
    return null
  }, [userCoords, lugares])

  const basePlacesEnriched = useMemo(
    () => (distOrigin ? enrichAllPlaces(lugares, distOrigin) : enrichPlacesWithZone(lugares, null)),
    [lugares, distOrigin],
  )

  const baseEventsEnriched = useMemo(
    () => (distOrigin ? enrichAllEvents(eventos, distOrigin) : enrichEventsWithZone(eventos, null)),
    [eventos, distOrigin],
  )

  const lugaresForView = useMemo(
    () => mergeSearchPlaces(basePlacesEnriched, remoteLugares, deferredSearchQuery),
    [basePlacesEnriched, remoteLugares, deferredSearchQuery],
  )

  const eventosForView = useMemo(
    () => mergeSearchEvents(baseEventsEnriched, remoteEventos, deferredSearchQuery),
    [baseEventsEnriched, remoteEventos, deferredSearchQuery],
  )

  const actividadForView = useMemo(() => {
    const q = deferredSearchQuery.trim()
    if (!q) return actividad
    return actividad.filter(a =>
      matchesSearch(a.nombre, q) || matchesSearch(a.quien, q),
    )
  }, [actividad, deferredSearchQuery])

  const searchSuggestions = useMemo(
    () => buildSearchSuggestions(lugaresForView, eventosForView, personas, deferredSearchQuery),
    [lugaresForView, eventosForView, personas, deferredSearchQuery],
  )

  const { filteredPlaces, filteredEvents } = useMemo(
    () => applyDiscoverFilters(
      lugaresForView,
      eventosForView,
      appliedCategoryFilter,
      appliedLocationFilter,
      userCoords != null,
    ),
    [lugaresForView, eventosForView, appliedCategoryFilter, appliedLocationFilter, userCoords],
  )

  const isFilterMode = appliedLocationFilter != null || appliedCategoryFilter !== 'Todos' || isSearchActive
  const showBrowseSections = !isFilterMode

  const cercaDeTi = useMemo(
    () => showBrowseSections ? buildCercaDeTi(basePlacesEnriched, baseEventsEnriched) : [],
    [showBrowseSections, basePlacesEnriched, baseEventsEnriched],
  )

  const masDestacados = useMemo(
    () => showBrowseSections ? buildMasDestacados(basePlacesEnriched, baseEventsEnriched) : [],
    [showBrowseSections, basePlacesEnriched, baseEventsEnriched],
  )

  const hero = useMemo(
    () => showBrowseSections ? topFeaturedEvent(baseEventsEnriched) : null,
    [showBrowseSections, baseEventsEnriched],
  )

  const carouselDestacados = useMemo(() => {
    if (!hero) return masDestacados
    return masDestacados.filter(s => !(s.kind === 'event' && s.data.id === hero.id))
  }, [masDestacados, hero])

  const { noche, manana, finde } = useMemo(
    () => showBrowseSections ? groupEventsByBucket(filteredEvents) : { noche: [], manana: [], finde: [] },
    [showBrowseSections, filteredEvents],
  )

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

  const openPlace = useCallback((placeId: string) => {
    if (user?.id) logPlaceView(user.id, placeId)
    deferredPush(`/lugares/${placeId}`)
  }, [user?.id])

  const wrapCarouselItem = useCallback((id: string, index: number, node: ReactNode) => {
    const isNew = !seenCarouselIdsRef.current.has(id)
    if (isNew) seenCarouselIdsRef.current.add(id)

    return (
      <FadeInView
        key={id}
        animate={isNew}
        delay={isNew ? discoverItemEnterDelay(index) : 0}
        style={styles.carouselItemWrap}
      >
        {node}
      </FadeInView>
    )
  }, [])

  const renderPlaceCarouselCard = (lu: PlaceCardData, index: number, key?: string) =>
    wrapCarouselItem(
      key ?? lu.id,
      index,
      <DiscoverCarouselCard
        title={lu.name}
        category={lu.category}
        locale={locale}
        photoUri={firstPhoto(lu.photos)}
        rating={lu.rating_avg ?? null}
        minutes={minutesLabel(lu, locale)}
        zone={zoneLabel(lu._zone, locale)}
        isOpen={calcIsOpen(lu.hours, lu.is_open ?? false)}
        badge={placeBadge(lu)}
        onPress={() => openPlace(lu.id)}
      />,
    )

  const renderEventCarouselCard = (
    ev: EventCardData & { _zone?: string | null },
    index: number,
    key?: string,
  ) =>
    wrapCarouselItem(
      key ?? ev.id,
      index,
      <DiscoverCarouselCard
        title={ev.name}
        category={ev.category}
        locale={locale}
        photoUri={firstPhoto(ev.photos)}
        minutes={formatEventDateShort(ev.start_datetime)}
        zone={zoneLabel(ev._zone, locale)}
        isOpen={null}
        badge={eventBadge(ev)}
        onPress={() => deferredPush(`/eventos/${ev.id}`)}
      />,
    )

  const renderSuggestionCard = (s: DiscoverSuggestion, index: number) => {
    const key = suggestionKey(s)
    return s.kind === 'place'
      ? renderPlaceCarouselCard(s.data, index, key)
      : renderEventCarouselCard(s.data, index, key)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/welcome')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        scrollEventThrottle={16}
        decelerationRate="normal"
        bounces
        overScrollMode="always"
        onScroll={handleScroll}
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
          onChangeText={handleSearchChange}
          placeholder={t.searchPlaceholder}
          suggestions={searchSuggestions}
          searching={searching || searchQuery !== deferredSearchQuery}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.hList}
          >
            <DiscoverCarouselSkeleton />
            <DiscoverCarouselSkeleton />
            <DiscoverCarouselSkeleton />
          </ScrollView>
        )}

        {isError && !loading && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>No se pudo cargar el contenido</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={styles.emptyLink}>Reintentar</Text>
            </TouchableOpacity>
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
          <SectionHeader title={`Resultados · "${deferredSearchQuery.trim()}"`} />
        )}

        {isFilterMode && (
          <SectionHeader title={filterSummary || 'Resultados'} />
        )}

        {(isFilterMode || isSearchActive) && !isFilterPending && filteredPlaces.length > 0 && (
          <DiscoverCarouselSection title="Lugares">
            {filteredPlaces.slice(0, FILTER_RESULTS_CAP).map((lu, i) => renderPlaceCarouselCard(lu, i))}
          </DiscoverCarouselSection>
        )}

        {(isFilterMode || isSearchActive) && !isFilterPending && filteredEvents.length > 0 && (
          <DiscoverCarouselSection title="Eventos">
            {filteredEvents.slice(0, FILTER_RESULTS_CAP).map((ev, i) => renderEventCarouselCard(ev, i))}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && loading && (
          <>
            <DiscoverCarouselSection title="Cerca de ti" loading />
            <DiscoverCarouselSection title="Más Destacados" loading />
            <SectionHeader title="Experiencia destacada" />
            <View style={styles.heroWrap}>
              <DiscoverHeroSkeleton />
            </View>
            <DiscoverCarouselSection title="Esta noche" loading />
            <DiscoverCarouselSection title="Mañana" loading />
            <DiscoverCarouselSection title="Este fin de semana" loading />
          </>
        )}

        {showBrowseSections && !loading && cercaDeTi.length > 0 && (
          <DiscoverCarouselSection title="Cerca de ti">
            {cercaDeTi.map((s, i) => renderSuggestionCard(s, i))}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && !loading && showEventSections && carouselDestacados.length > 0 && (
          <DiscoverCarouselSection title="Más Destacados">
            {carouselDestacados.map((s, i) => renderSuggestionCard(s, i))}
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
            <FadeInView delay={40}>
              <TouchableOpacity style={styles.friendCard} onPress={() => deferredPush(actividadForView[0].href as any)} activeOpacity={0.9}>
                <AvatarGroup items={actividadForView.slice(0, 4).map(a => ({ id: a.id, initials: a.ini }))} max={4} size={36} />
                <View style={styles.friendBody}>
                  <Text style={styles.friendTitle} numberOfLines={1}>{actividadForView[0].nombre}</Text>
                  <Text style={styles.friendSub} numberOfLines={1}>
                    {actividadForView[0].quien}{actividadForView.length > 1 ? ` y ${actividadForView.length - 1} más van` : ' va'}
                  </Text>
                </View>
              </TouchableOpacity>
            </FadeInView>
          </>
        )}

        {showBrowseSections && hero && !loading && showEventSections && (
          <>
            <SectionHeader title="Experiencia destacada" />
            <FadeInView delay={80} style={styles.heroWrap}>
              <HeroCard event={hero} badge="Destacado" onPress={() => deferredPush(`/eventos/${hero.id}`)} />
            </FadeInView>
          </>
        )}

        {showBrowseSections && noche.length > 0 && (
          <DiscoverCarouselSection title="Esta noche">
            {noche.slice(0, 8).map((ev, i) => renderEventCarouselCard(ev, i))}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && manana.length > 0 && (
          <DiscoverCarouselSection title="Mañana">
            {manana.slice(0, 8).map((ev, i) => renderEventCarouselCard(ev, i))}
          </DiscoverCarouselSection>
        )}

        {showBrowseSections && finde.length > 0 && (
          <DiscoverCarouselSection title="Este fin de semana">
            {finde.slice(0, 8).map((ev, i) => renderEventCarouselCard(ev, i))}
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

      <OnboardingModal
        visible={mostrarOnboarding}
        onDone={() => {
          setMostrarOnboarding(false)
          dismissOnboarding()
          refreshProfile()
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: S.xxxl },
  carouselItemWrap: { width: DISCOVER_CAROUSEL_W },
  hList: { paddingHorizontal: S.lg, gap: S.md, paddingBottom: 4 },
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

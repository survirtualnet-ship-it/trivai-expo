import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search } from 'lucide-react-native'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { useLocale } from '@/hooks/useLocale'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { DiscoverHeader } from '@/components/ui/DiscoverHeader'
import { FilterChip } from '@/components/ui/FilterChip'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { PlaceCard, type PlaceCardData } from '@/components/ui/PlaceCard'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, esHoy } from '@/lib/eventUtils'
import { dedupePlaces } from '@/lib/places'
import { CATEGORIES, normalizeCategory, type Category } from '@/lib/categories'
import { DISCOVER_STRINGS, categoryLabel } from '@/lib/i18n/discover'

type QuickFilter = 'hoy' | 'cerca' | 'trending' | null

const CATEGORY_ROUTES: Record<Category, () => void> = {
  Gastronomía:     () => deferredPush({ pathname: '/lugares', params: { cat: 'Gastronomía' } }),
  Entretenimiento: () => deferredPush({ pathname: '/lugares', params: { cat: 'Entretenimiento' } }),
  Parques:         () => deferredPush({ pathname: '/lugares', params: { cat: 'Parques' } }),
  Otros:           () => deferredPush({ pathname: '/lugares', params: { cat: 'Otros' } }),
}

function applyQuickFilterPlaces(list: PlaceCardData[], quickFilter: QuickFilter, hasCoords: boolean) {
  let out = [...list]
  if (quickFilter === 'cerca' && hasCoords) {
    out = out.filter(l => l._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
  } else {
    out.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0))
  }
  return out
}

function applyQuickFilterEvents(list: EventCardData[], quickFilter: QuickFilter) {
  let out = [...list]
  if (quickFilter === 'hoy') out = out.filter(e => esHoy(e.start_datetime))
  if (quickFilter === 'cerca') out = out.filter(e => e._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
  if (quickFilter === 'trending') out.sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0))
  return out
}

export default function Discover() {
  const { profile, isAuthenticated, signOut } = useUser()
  const { locale, setLocale } = useLocale()
  const t = DISCOVER_STRINGS[locale]

  const [lugares, setLugares] = useState<PlaceCardData[]>([])
  const [eventos, setEventos] = useState<EventCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [sinLeer, setSinLeer] = useState(0)
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  const cityName = profile?.city ?? 'Santa Cruz de la Sierra'

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
          .limit(80),
        supabase.from('events')
          .select('id,name,category,start_datetime,is_free,price,attendees_count,place:places(name,address,latitude,longitude)')
          .eq('is_active', true)
          .gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(40),
      ]

      if (user) {
        queries.push(
          supabase.from('notifications').select('id, type').eq('user_id', user.id).eq('is_read', false),
        )
      }

      const results = await Promise.all(queries)
      const [lugRes, evtRes, notifRes] = results

      if (lugRes?.data) setLugares(dedupePlaces(lugRes.data))
      if (evtRes?.data) {
        setEventos(evtRes.data.map((e: any) => ({ ...e, attendees_count: e.attendees_count ?? 0 })))
      }

      if (notifRes?.data && user) {
        const prefs = await loadNotifPrefs(user.id)
        setSinLeer((notifRes.data as { type: string }[]).filter(n => prefAllows(prefs, n.type ?? 'system')).length)
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

  const filteredEvents = useMemo(
    () => applyQuickFilterEvents(eventosConDist, quickFilter),
    [eventosConDist, quickFilter],
  )

  const placesByCategory = useMemo(() => {
    const base = applyQuickFilterPlaces(lugaresConDist, quickFilter, !!userCoords)
    const map = Object.fromEntries(CATEGORIES.map(c => [c, [] as PlaceCardData[]])) as Record<Category, PlaceCardData[]>

    for (const place of base) {
      const cat = normalizeCategory(place.category)
      map[cat].push(place)
    }

    for (const cat of CATEGORIES) {
      map[cat] = map[cat].slice(0, 4)
    }

    return map
  }, [lugaresConDist, quickFilter, userCoords])

  const eventosEntretenimiento = useMemo(
    () => filteredEvents.slice(0, 3),
    [filteredEvents],
  )

  const toggleQuick = (f: QuickFilter) => setQuickFilter(prev => (prev === f ? null : f))

  const hasAnyContent = CATEGORIES.some(c => placesByCategory[c].length > 0) || eventosEntretenimiento.length > 0

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth')
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

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

        <TouchableOpacity style={styles.search} onPress={() => deferredPush('/buscar')} activeOpacity={0.85}>
          <Search size={18} color={T.fg3} />
          <Text style={styles.searchPh}>{t.searchPlaceholder}</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label={t.filterHoy} active={quickFilter === 'hoy'} onPress={() => toggleQuick('hoy')} />
          <FilterChip label={t.filterCerca} active={quickFilter === 'cerca'} onPress={() => toggleQuick('cerca')} accent={T.secondary} />
          <FilterChip label={t.filterDestacados} active={quickFilter === 'trending'} onPress={() => toggleQuick('trending')} accent={T.accent} />
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={T.primary} size="large" style={{ marginTop: S.xxxl }} />
        ) : (
          CATEGORIES.map(cat => {
            const places = placesByCategory[cat]
            const showEvents = cat === 'Entretenimiento' && eventosEntretenimiento.length > 0
            if (places.length === 0 && !showEvents) return null

            return (
              <View key={cat}>
                <SectionHeader
                  title={categoryLabel(cat, locale)}
                  actionLabel={t.seeAll}
                  onAction={CATEGORY_ROUTES[cat]}
                />

                {showEvents && (
                  <>
                    <Text style={styles.subSection}>{t.eventsInCategory}</Text>
                    <View style={styles.list}>
                      {eventosEntretenimiento.map(ev => (
                        <EventCard
                          key={ev.id}
                          event={ev}
                          variant="list"
                          onPress={() => deferredPush(`/eventos/${ev.id}`)}
                        />
                      ))}
                    </View>
                  </>
                )}

                {places.length > 0 && (
                  <View style={styles.list}>
                    {places.map(lu => (
                      <PlaceCard
                        key={lu.id}
                        place={lu}
                        locale={locale}
                        onPress={() => deferredPush(`/lugares/${lu.id}`)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )
          })
        )}

        {!loading && !hasAnyContent && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>{t.noResults}</Text>
            <TouchableOpacity onPress={() => setQuickFilter(null)}>
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
  search: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    marginHorizontal: S.lg, marginTop: S.sm,
    backgroundColor: T.surface, borderRadius: R.xl,
    paddingHorizontal: S.lg, height: 52, ...SHADOW.sm,
  },
  searchPh: { flex: 1, fontFamily: FONT.regular, fontSize: F.size.md, color: T.fg3 },
  filters: { paddingHorizontal: S.lg, gap: S.sm, paddingTop: S.lg, paddingBottom: S.xs },
  list: { paddingHorizontal: S.lg, gap: S.md, marginBottom: S.lg },
  subSection: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    color: T.fg3,
    paddingHorizontal: S.lg,
    marginBottom: S.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyWrap: { alignItems: 'center', paddingTop: S.xxxl, gap: S.sm },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontFamily: FONT.bold, fontSize: F.size.lg, color: T.fg1 },
  emptyLink: { fontFamily: FONT.semibold, fontSize: F.size.md, color: T.primary },
})

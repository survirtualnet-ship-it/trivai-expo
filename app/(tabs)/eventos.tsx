import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, SlidersHorizontal, Map } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S } from '@/lib/tokens'
import { deferredPush } from '@/lib/deferredNav'
import { TrivaiHeader } from '@/components/TrivaiHeader'
import { FilterPill } from '@/components/eventos/FilterPill'
import { DateCard, DateCalendarButton } from '@/components/eventos/DateCard'
import { SectionHeader } from '@/components/eventos/SectionHeader'
import { FeaturedEventCard, FeaturedDots, FEATURED_W } from '@/components/eventos/FeaturedEventCard'
import { EventListItem, type ListEvent } from '@/components/eventos/EventListItem'
import { getCurrentCoords } from '@/lib/geolocation'
import { normalizeCategory } from '@/lib/categories'
import { loadSavedEventIds } from '@/lib/favorites'

type FiltroPill = 'Todos' | 'Hoy' | 'Este fin de semana' | 'Gratuitos' | 'Música' | 'Arte'

const PILLS: FiltroPill[] = ['Todos', 'Hoy', 'Este fin de semana', 'Gratuitos', 'Música', 'Arte']

const DIAS_ES  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function generarDias(n = 14) {
  const hoy = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return { dia: DIAS_ES[d.getDay()], num: d.getDate(), mes: MESES_ES[d.getMonth()], date: d }
  })
}

function esHoy(dt: string) {
  return new Date(dt).toDateString() === new Date().toDateString()
}

function esFinDeSemana(dt: string) {
  const d = new Date(dt)
  d.setHours(0, 0, 0, 0)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const day = hoy.getDay()
  const sab = new Date(hoy)
  if (day === 0) sab.setDate(hoy.getDate() - 1)
  else if (day !== 6) sab.setDate(hoy.getDate() + (6 - day))
  const dom = new Date(sab)
  dom.setDate(sab.getDate() + 1)
  return d.getTime() === sab.getTime() || d.getTime() === dom.getTime()
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return rad * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function pasaPill(ev: ListEvent, pill: FiltroPill) {
  if (pill === 'Todos') return true
  if (pill === 'Hoy') return esHoy(ev.start_datetime)
  if (pill === 'Este fin de semana') return esFinDeSemana(ev.start_datetime)
  if (pill === 'Gratuitos') return ev.is_free
  const cat = ev.category.toLowerCase()
  if (pill === 'Música') return cat.includes('música') || cat.includes('musica') || normalizeCategory(ev.category) === 'Entretenimiento'
  if (pill === 'Arte') return cat.includes('arte') || cat.includes('cultura') || normalizeCategory(ev.category) === 'Entretenimiento'
  return true
}

export default function Eventos() {
  const { initials, avatarUrl } = useUser()
  const [eventos, setEventos]         = useState<ListEvent[]>([])
  const [loading, setLoading]           = useState(true)
  const [pill, setPill]                 = useState<FiltroPill>('Todos')
  const [diaIdx, setDiaIdx]             = useState<number | null>(null)
  const [featuredIdx, setFeaturedIdx]   = useState(0)
  const [dias]                          = useState(generarDias(14))
  const [userCoords, setUserCoords]     = useState<{ lat: number; lng: number } | null>(null)
  const [savedEvents, setSavedEvents]   = useState<Set<string>>(new Set())

  useEffect(() => {
    getCurrentCoords().then(c => { if (c) setUserCoords(c) })
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSavedEvents(await loadSavedEventIds(session.user.id))
      }
    })
    supabase
      .from('events')
      .select('id,name,category,start_datetime,is_free,price,attendees_count,place:places(name,address,latitude,longitude)')
      .eq('is_active', true)
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setEventos(data as ListEvent[])
        setLoading(false)
      })
  }, [])

  const toggleSaved = (eventId: string, active: boolean) => {
    setSavedEvents(prev => {
      const next = new Set(prev)
      if (active) next.add(eventId)
      else next.delete(eventId)
      return next
    })
  }

  const eventosConDist = useMemo(() => {
    if (!userCoords) return eventos
    return eventos.map(ev => {
      const pl = ev.place as ListEvent['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude && pl?.longitude) {
        return { ...ev, _dist: haversineKm(userCoords.lat, userCoords.lng, pl.latitude, pl.longitude) }
      }
      return ev
    })
  }, [eventos, userCoords])

  const filtrados = useMemo(() => {
    return eventosConDist.filter(ev => {
      if (!pasaPill(ev, pill)) return false
      if (diaIdx !== null) {
        const sel = dias[diaIdx].date
        if (new Date(ev.start_datetime).toDateString() !== sel.toDateString()) return false
      }
      return true
    })
  }, [eventosConDist, pill, diaIdx, dias])

  const destacados = filtrados.slice(0, 5)
  const destacadoIds = new Set(destacados.map(e => e.id))
  const cerca = userCoords
    ? [...filtrados].filter(e => e._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    : filtrados
  const lista = cerca.filter(e => !destacadoIds.has(e.id))

  const onFeaturedScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (FEATURED_W + S.md))
    setFeaturedIdx(Math.max(0, Math.min(idx, destacados.length - 1)))
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TrivaiHeader
          light
          title="Eventos"
          left={
            <TouchableOpacity style={styles.avatarBtn} onPress={() => deferredPush('/perfil')}>
              {avatarUrl
                ? <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                : <Text style={styles.avatarIni}>{initials}</Text>}
            </TouchableOpacity>
          }
          right={
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/buscar')}>
                <Search size={20} color={T.fg2} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/buscar')}>
                <SlidersHorizontal size={20} color={T.fg2} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {PILLS.map(p => (
            <FilterPill
              key={p}
              label={p}
              active={pill === p}
              onPress={() => { setPill(p); setDiaIdx(null) }}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesRow}
        >
          {dias.map((d, i) => (
            <DateCard
              key={i}
              dia={d.dia}
              num={d.num}
              mes={d.mes}
              active={diaIdx === i}
              onPress={() => setDiaIdx(diaIdx === i ? null : i)}
            />
          ))}
          <DateCalendarButton onPress={() => setDiaIdx(null)} />
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={T.purple} style={styles.loader} />
        ) : filtrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyText}>No hay eventos para este filtro</Text>
            <TouchableOpacity onPress={() => { setPill('Todos'); setDiaIdx(null) }}>
              <Text style={styles.emptyAction}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {destacados.length > 0 && (
              <>
                <SectionHeader
                  title="Eventos destacados"
                  actionLabel="Ver todo"
                  onAction={() => router.push('/buscar')}
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={FEATURED_W + S.md}
                  decelerationRate="fast"
                  onScroll={onFeaturedScroll}
                  scrollEventThrottle={16}
                  contentContainerStyle={styles.featuredList}
                >
                  {destacados.map(item => (
                    <FeaturedEventCard
                      key={item.id}
                      event={item}
                      saved={savedEvents.has(item.id)}
                      onSaveToggle={active => toggleSaved(item.id, active)}
                      onPress={() => router.push(`/eventos/${item.id}`)}
                    />
                  ))}
                </ScrollView>

                <FeaturedDots count={destacados.length} active={featuredIdx} />
              </>
            )}

            <SectionHeader
              title="Eventos cerca de ti"
              actionLabel="Ver mapa"
              actionIcon={<Map size={15} color={T.purple} strokeWidth={2.25} />}
              onAction={() => router.push('/mapa')}
            />

            <View style={styles.listWrap}>
              {lista.map(ev => (
                <EventListItem
                  key={ev.id}
                  event={ev}
                  saved={savedEvents.has(ev.id)}
                  onSaveToggle={active => toggleSaved(ev.id, active)}
                  onPress={() => router.push(`/eventos/${ev.id}`)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: T.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarIni: {
    fontSize: F.size.sm,
    fontWeight: F.weight.bold,
    color: T.purple,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 2,
  },
  pillsRow: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingTop: S.lg,
    paddingBottom: S.md,
  },
  datesRow: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingBottom: S.md,
  },
  loader: {
    marginTop: 56,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: S.lg,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: S.md,
  },
  emptyText: {
    fontSize: F.size.base + 1,
    color: T.fg1,
    fontWeight: F.weight.bold,
    marginBottom: S.sm,
    textAlign: 'center',
  },
  emptyAction: {
    fontSize: F.size.base,
    color: T.purple,
    fontWeight: F.weight.semibold,
  },
  featuredList: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  listWrap: {
    paddingHorizontal: S.lg,
    gap: S.md,
  },
})

import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, SlidersHorizontal } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'
import { AppHeader, ProfileAvatar } from '@/components/ui/AppHeader'
import { FilterChip, FilterChipGhost } from '@/components/ui/FilterChip'
import { HeroCard, HERO_H } from '@/components/ui/HeroCard'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadSavedEventIds } from '@/lib/favorites'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, esHoy, esFinDeSemana } from '@/lib/eventUtils'

type SmartFilter = 'Todos' | 'Hoy' | 'Fin de semana' | 'Gratuitos'

const SMART: SmartFilter[] = ['Todos', 'Hoy', 'Fin de semana', 'Gratuitos']
const { height: SH } = Dimensions.get('window')

function pasaFilter(ev: EventCardData, f: SmartFilter) {
  if (f === 'Todos') return true
  if (f === 'Hoy') return esHoy(ev.start_datetime)
  if (f === 'Fin de semana') return esFinDeSemana(ev.start_datetime)
  if (f === 'Gratuitos') return (ev as any).is_free === true
  return true
}

export default function Eventos() {
  const { initials, avatarUrl } = useUser()
  const [eventos, setEventos] = useState<EventCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<SmartFilter>('Todos')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    getCurrentCoords().then(c => { if (c) setUserCoords(c) })
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setSavedEvents(await loadSavedEventIds(session.user.id))
    })
    supabase
      .from('events')
      .select('id,name,category,start_datetime,is_free,price,attendees_count,place:places(name,address,latitude,longitude)')
      .eq('is_active', true)
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setEventos(data as EventCardData[])
        setLoading(false)
      })
  }, [])

  const toggleSaved = (id: string, active: boolean) => {
    setSavedEvents(prev => {
      const next = new Set(prev)
      if (active) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const withDist = useMemo(() => {
    if (!userCoords) return eventos
    return eventos.map(ev => {
      const pl = ev.place as EventCardData['place'] & { latitude?: number; longitude?: number }
      if (pl?.latitude && pl?.longitude) {
        return { ...ev, _dist: haversineKm(userCoords.lat, userCoords.lng, pl.latitude, pl.longitude) }
      }
      return ev
    })
  }, [eventos, userCoords])

  const filtrados = useMemo(
    () => withDist.filter(ev => pasaFilter(ev, filter)),
    [withDist, filter],
  )

  const hero = filtrados[0] ?? null
  const lista = filtrados.slice(1)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <AppHeader
          title="Eventos"
          left={<ProfileAvatar initials={initials} avatarUrl={avatarUrl} onPress={() => deferredPush('/perfil')} />}
          right={(
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => deferredPush('/buscar')}>
                <Search size={20} color={T.fg2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => deferredPush('/buscar')}>
                <SlidersHorizontal size={20} color={T.fg2} />
              </TouchableOpacity>
            </View>
          )}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {SMART.slice(0, 3).map(f => (
            <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
          <FilterChipGhost label="Editar filtros" onPress={() => deferredPush('/buscar')} />
        </ScrollView>

        {loading ? (
          <View style={styles.heroSkeleton}>
            <Skeleton height={Math.min(SH * 0.6, HERO_H)} width="100%" style={{ borderRadius: R.xl }} />
          </View>
        ) : filtrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyText}>No hay eventos para este filtro</Text>
            <TouchableOpacity onPress={() => setFilter('Todos')}>
              <Text style={styles.emptyLink}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {hero && (
              <View style={styles.heroWrap}>
                <HeroCard
                  event={hero}
                  saved={savedEvents.has(hero.id)}
                  onSaveToggle={a => toggleSaved(hero.id, a)}
                  ctaLabel="Reservar"
                  badge="Destacado"
                  onPress={() => deferredPush(`/eventos/${hero.id}`)}
                />
              </View>
            )}

            <SectionHeader title="Próximos eventos" actionLabel="Mapa" onAction={() => deferredPush('/mapa')} />

            <View style={styles.list}>
              {lista.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  variant="list"
                  saved={savedEvents.has(ev.id)}
                  onSaveToggle={a => toggleSaved(ev.id, a)}
                  ctaLabel="Ver"
                  onPress={() => deferredPush(`/eventos/${ev.id}`)}
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
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingBottom: 40 },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
  },
  filters: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingTop: S.md,
    paddingBottom: S.md,
  },
  heroWrap: { paddingHorizontal: S.lg, marginBottom: S.sm },
  heroSkeleton: { paddingHorizontal: S.lg, marginTop: S.md },
  list: { paddingHorizontal: S.lg, gap: S.md },
  empty: { alignItems: 'center', paddingTop: 56, gap: S.sm },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontFamily: 'Inter_600SemiBold', fontSize: F.size.lg, color: T.fg1 },
  emptyLink: { fontFamily: 'Inter_600SemiBold', fontSize: F.size.md, color: T.primary },
})

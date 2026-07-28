import { useState, useEffect, useMemo, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, X } from 'lucide-react-native'
import { T, F, S, R } from '@/lib/tokens'
import { useEvents } from '@/hooks/useEvents'
import { useUser } from '@/hooks/useUser'
import { AppHeader, HeaderLogo } from '@/components/ui/AppHeader'
import { FilterChip } from '@/components/ui/FilterChip'
import { HeroCard, HERO_H } from '@/components/ui/HeroCard'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { SectionHeader } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadSavedEventIds } from '@/lib/favorites'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, esHoy, esFinDeSemana } from '@/lib/eventUtils'

type SmartFilter = 'Todos' | 'Hoy' | 'Fin de semana' | 'Gratuitos' | 'Música' | 'Arte'

const SMART: SmartFilter[] = ['Todos', 'Hoy', 'Fin de semana', 'Gratuitos', 'Música', 'Arte']
const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const { height: SH } = Dimensions.get('window')

function generarDias(cantidad = 30) {
  const hoy = new Date()
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return {
      offset: i,
      dia: DIAS_ES[d.getDay()],
      num: String(d.getDate()),
      mes: MESES_ES[d.getMonth()],
    }
  })
}

function pasaFilter(ev: EventCardData, f: SmartFilter, dayOffset: number | null) {
  if (dayOffset !== null) {
    const target = new Date()
    target.setDate(target.getDate() + dayOffset)
    if (new Date(ev.start_datetime).toDateString() !== target.toDateString()) return false
  }
  if (f === 'Todos') return true
  if (f === 'Hoy') return esHoy(ev.start_datetime)
  if (f === 'Fin de semana') return esFinDeSemana(ev.start_datetime)
  if (f === 'Gratuitos') return ev.is_free === true
  if (f === 'Música') return /música|musica|music/i.test(ev.category)
  if (f === 'Arte') return /arte|art|cultura/i.test(ev.category)
  return true
}

export default function Eventos() {
  const { user } = useUser()
  const { data: eventos = [], isLoading: loading } = useEvents({ limit: 50 })
  const [filter, setFilter] = useState<SmartFilter>('Todos')
  const [dayOffset, setDayOffset] = useState<number | null>(null)
  const [dias] = useState(() => generarDias(30))
  const [buscando, setBuscando] = useState(false)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const searchRef = useRef<TextInput>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [savedEvents, setSavedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    getCurrentCoords().then(c => { if (c) setUserCoords(c) })
  }, [])

  useEffect(() => {
    if (!user) return
    loadSavedEventIds(user.id).then(setSavedEvents)
  }, [user])

  useEffect(() => {
    if (buscando) setTimeout(() => searchRef.current?.focus(), 50)
  }, [buscando])

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

  const filtrados = useMemo(() => {
    let lista = withDist.filter(ev => pasaFilter(ev, filter, dayOffset))
    const q = textoBusqueda.trim().toLowerCase()
    if (q.length >= 2) {
      lista = lista.filter(ev => ev.name.toLowerCase().includes(q))
    }
    return lista
  }, [withDist, filter, dayOffset, textoBusqueda])

  const hero = filtrados[0] ?? null
  const lista = filtrados.slice(1)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <AppHeader
          title="Eventos"
          left={<HeaderLogo onPress={() => deferredPush('/')} />}
          right={(
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setBuscando(v => !v)}
              >
                {buscando ? <X size={20} color={T.fg2} /> : <Search size={20} color={T.fg2} />}
              </TouchableOpacity>
            </View>
          )}
        />

        {buscando && (
          <View style={styles.searchRow}>
            <Search size={17} color={T.fg3} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              value={textoBusqueda}
              onChangeText={setTextoBusqueda}
              placeholder="Buscar eventos..."
              placeholderTextColor={T.fg3}
              returnKeyType="search"
            />
            {textoBusqueda.length > 0 && (
              <TouchableOpacity onPress={() => setTextoBusqueda('')}>
                <X size={16} color={T.fg3} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {SMART.map(f => (
            <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPicker}>
          <TouchableOpacity
            style={[styles.dayChip, dayOffset === null && styles.dayChipActive]}
            onPress={() => setDayOffset(null)}
          >
            <Text style={[styles.dayChipText, dayOffset === null && styles.dayChipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {dias.map(d => (
            <TouchableOpacity
              key={d.offset}
              style={[styles.dayChip, dayOffset === d.offset && styles.dayChipActive]}
              onPress={() => setDayOffset(d.offset)}
            >
              <Text style={[styles.dayLabel, dayOffset === d.offset && styles.dayChipTextActive]}>{d.dia}</Text>
              <Text style={[styles.dayNum, dayOffset === d.offset && styles.dayChipTextActive]}>{d.num}</Text>
              <Text style={[styles.dayMes, dayOffset === d.offset && styles.dayChipTextActive]}>{d.mes}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.heroSkeleton}>
            <Skeleton height={Math.min(SH * 0.6, HERO_H)} width="100%" style={{ borderRadius: R.xl }} />
          </View>
        ) : filtrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyText}>No hay eventos para este filtro</Text>
            <TouchableOpacity onPress={() => { setFilter('Todos'); setDayOffset(null); setTextoBusqueda('') }}>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginHorizontal: S.lg,
    marginTop: S.sm,
    backgroundColor: T.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: S.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: F.size.md, color: T.fg1 },
  filters: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingTop: S.md,
    paddingBottom: S.sm,
  },
  dayPicker: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingBottom: S.md,
  },
  dayChip: {
    width: 56,
    paddingVertical: S.sm,
    borderRadius: R.md,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
  },
  dayChipActive: { backgroundColor: T.purple, borderColor: T.purple },
  dayChipText: { fontSize: F.size.xs, color: T.fg2 },
  dayChipTextActive: { color: '#fff' },
  dayLabel: { fontSize: 10, color: T.fg3, fontWeight: F.weight.semibold },
  dayNum: { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  dayMes: { fontSize: 10, color: T.fg3 },
  heroWrap: { paddingHorizontal: S.lg, marginBottom: S.sm },
  heroSkeleton: { paddingHorizontal: S.lg, marginTop: S.md },
  list: { paddingHorizontal: S.lg, gap: S.md },
  empty: { alignItems: 'center', paddingTop: 56, gap: S.sm },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontFamily: 'Inter_600SemiBold', fontSize: F.size.lg, color: T.fg1 },
  emptyLink: { fontFamily: 'Inter_600SemiBold', fontSize: F.size.md, color: T.primary },
})

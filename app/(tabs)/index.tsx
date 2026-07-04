import { useState, useEffect, useMemo } from 'react'
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, SlidersHorizontal } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { AppHeader, ProfileAvatar } from '@/components/ui/AppHeader'
import { FilterChip, FilterChipGhost } from '@/components/ui/FilterChip'
import { EventCard, type EventCardData } from '@/components/ui/EventCard'
import { HeroCard } from '@/components/ui/HeroCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { getCurrentCoords } from '@/lib/geolocation'
import { loadNotifPrefs, prefAllows } from '@/lib/notifPrefs'
import { deferredPush } from '@/lib/deferredNav'
import { haversineKm, groupEventsByBucket, esHoy } from '@/lib/eventUtils'

type QuickFilter = 'hoy' | 'cerca' | 'trending' | null

interface FriendActivity {
  id: string
  quien: string
  ini: string
  nombre: string
  href: string
}

export default function Discover() {
  const { displayName, initials, avatarUrl } = useUser()
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
      const [evtRes, f1Res, f2Res, notifRes] = results

      if (evtRes?.data) {
        setEventos(evtRes.data.map((e: any) => ({
          ...e,
          attendees_count: e.attendees_count ?? 0,
        })))
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

  const filtered = useMemo(() => {
    let list = [...withDist]
    if (quickFilter === 'hoy') list = list.filter(e => esHoy(e.start_datetime))
    if (quickFilter === 'cerca') list = [...list].filter(e => e._dist != null).sort((a, b) => (a._dist ?? 99) - (b._dist ?? 99))
    if (quickFilter === 'trending') list = [...list].sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0))
    return list
  }, [withDist, quickFilter])

  const trending = useMemo(
    () => [...withDist].sort((a, b) => (b.attendees_count ?? 0) - (a.attendees_count ?? 0)).slice(0, 8),
    [withDist],
  )

  const hero = trending[0] ?? filtered[0] ?? null
  const { noche, manana, finde } = groupEventsByBucket(filtered)

  const toggleQuick = (f: QuickFilter) => setQuickFilter(prev => (prev === f ? null : f))

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <AppHeader
          greeting={`Hola, ${displayName}`}
          subtitle="¿Qué te apetece hoy?"
          left={<ProfileAvatar initials={initials} avatarUrl={avatarUrl} onPress={() => deferredPush('/perfil')} />}
          onNotifPress={() => deferredPush('/notificaciones')}
          notifCount={sinLeer}
        />

        <TouchableOpacity style={styles.search} onPress={() => deferredPush('/buscar')} activeOpacity={0.85}>
          <Search size={18} color={T.fg3} />
          <Text style={styles.searchPh}>Buscar experiencias...</Text>
          <SlidersHorizontal size={18} color={T.primary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label="Hoy" active={quickFilter === 'hoy'} onPress={() => toggleQuick('hoy')} />
          <FilterChip label="Cerca" active={quickFilter === 'cerca'} onPress={() => toggleQuick('cerca')} accent={T.secondary} />
          <FilterChip label="Trending" active={quickFilter === 'trending'} onPress={() => toggleQuick('trending')} accent={T.accent} />
          <FilterChipGhost label="Filtros" onPress={() => deferredPush('/buscar')} />
        </ScrollView>

        <SectionHeader title="Trending now" actionLabel="Ver todo" onAction={() => deferredPush('/eventos')} />

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            <SkeletonCard /><SkeletonCard />
          </ScrollView>
        ) : (
          <FlatList
            horizontal
            data={trending}
            keyExtractor={e => e.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                variant="horizontal"
                onPress={() => deferredPush(`/eventos/${item.id}`)}
              />
            )}
            ListEmptyComponent={<Text style={styles.empty}>No hay eventos trending</Text>}
          />
        )}

        {actividad.length > 0 && (
          <>
            <SectionHeader title="Actividad de amigos" actionLabel="Ver más" onAction={() => deferredPush('/amigos')} />
            <TouchableOpacity style={styles.friendCard} onPress={() => deferredPush(actividad[0].href as any)} activeOpacity={0.9}>
              <AvatarGroup
                items={actividad.slice(0, 4).map(a => ({ id: a.id, initials: a.ini }))}
                max={4}
                size={36}
              />
              <View style={styles.friendBody}>
                <Text style={styles.friendTitle} numberOfLines={1}>{actividad[0].nombre}</Text>
                <Text style={styles.friendSub} numberOfLines={1}>
                  {actividad[0].quien}{actividad.length > 1 ? ` y ${actividad.length - 1} más van` : ' va'}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {hero && !loading && (
          <>
            <SectionHeader title="Experiencia destacada" />
            <View style={styles.heroWrap}>
              <HeroCard
                event={hero}
                badge="Trending"
                onPress={() => deferredPush(`/eventos/${hero.id}`)}
              />
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

        {!loading && filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>Sin eventos para este filtro</Text>
            <TouchableOpacity onPress={() => setQuickFilter(null)}>
              <Text style={styles.emptyLink}>Ver todos los eventos</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginHorizontal: S.lg,
    marginTop: S.sm,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    paddingHorizontal: S.lg,
    height: 52,
    ...SHADOW.sm,
  },
  searchPh: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.md,
    color: T.fg3,
  },
  filters: {
    paddingHorizontal: S.lg,
    gap: S.sm,
    paddingTop: S.lg,
    paddingBottom: S.xs,
  },
  hList: { paddingHorizontal: S.lg, gap: S.md, paddingBottom: 4 },
  heroWrap: { paddingHorizontal: S.lg },
  list: { paddingHorizontal: S.lg, gap: S.md },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    marginHorizontal: S.lg,
    backgroundColor: T.surface,
    borderRadius: R.xl,
    padding: S.lg,
    ...SHADOW.md,
  },
  friendBody: { flex: 1, minWidth: 0 },
  friendTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.md,
    fontWeight: F.weight.bold,
    color: T.fg1,
  },
  friendSub: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    marginTop: 2,
  },
  empty: {
    fontFamily: FONT.regular,
    fontSize: F.size.sm,
    color: T.fg3,
    paddingHorizontal: S.lg,
  },
  emptyWrap: { alignItems: 'center', paddingTop: S.xxxl, gap: S.sm },
  emptyIcon: { fontSize: 40 },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    color: T.fg1,
  },
  emptyLink: {
    fontFamily: FONT.semibold,
    fontSize: F.size.md,
    color: T.primary,
  },
})

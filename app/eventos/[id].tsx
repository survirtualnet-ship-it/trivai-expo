import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Dimensions, Share,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Calendar, MapPin, Users, ChevronLeft, Share2, Heart } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import type { Event, Place } from '@/lib/supabase'
import { T, F, S, R, SHADOW } from '@/lib/tokens'
import { FONT } from '@/lib/typography'
import { CatCover, CategoryPill } from '@/components/CatCover'
import { AvatarGroup } from '@/components/ui/AvatarGroup'
import { grantXP, XP } from '@/lib/xp'
import { appLink } from '@/lib/appUrl'
import { formatEventDateLong } from '@/lib/eventUtils'
import { deferredPush } from '@/lib/deferredNav'

const { width: SW } = Dimensions.get('window')

export default function EventoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [evento, setEvento] = useState<Event | null>(null)
  const [lugar, setLugar] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [asistire, setAsistire] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [asistentes, setAsistentes] = useState<{ id: string; ini: string; avatarUrl?: string | null }[]>([])
  const [totalAsist, setTotalAsist] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single()
      if (data) {
        setEvento(data)
        if (data.place_id) {
          const { data: pl } = await supabase.from('places').select('*').eq('id', data.place_id).single()
          if (pl) setLugar(pl)
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: att } = await supabase
          .from('event_attendees').select('id')
          .eq('event_id', id).eq('user_id', session.user.id).maybeSingle()
        setAsistire(!!att)
      }

      const [{ data: attList }, { count }] = await Promise.all([
        supabase.from('event_attendees')
          .select('profile:profiles(id, full_name, username, avatar_url)')
          .eq('event_id', id).eq('status', 'going').limit(8),
        supabase.from('event_attendees')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', id).eq('status', 'going'),
      ])
      setTotalAsist(count ?? 0)
      setAsistentes((attList ?? []).map((a: any) => {
        const nombre = a.profile?.full_name ?? a.profile?.username ?? 'U'
        return {
          id: a.profile?.id ?? nombre,
          ini: nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          avatarUrl: a.profile?.avatar_url,
        }
      }))

      setLoading(false)
    }
    load()
  }, [id])

  const toggleAsistencia = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { deferredPush('/auth'); return }
    setToggling(true)
    if (asistire) {
      await supabase.from('event_attendees').delete().eq('event_id', id).eq('user_id', session.user.id)
      setAsistire(false)
      setTotalAsist(n => Math.max(0, n - 1))
    } else {
      await supabase.from('event_attendees').upsert({ event_id: id, user_id: session.user.id, status: 'going' })
      setAsistire(true)
      setTotalAsist(n => n + 1)
      grantXP(session.user.id, XP.asistir)
    }
    setToggling(false)
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.primary} size="large" /></View>
  }

  if (!evento) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Evento no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Volver</Text></TouchableOpacity>
      </View>
    )
  }

  const compartir = () => {
    const url = appLink(`/eventos/${evento.id}`)
    Share.share({ title: evento.name, message: `${evento.name} — ${url}`, url })
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>

        <View style={styles.heroWrap}>
          {evento.photos?.length ? (
            <FlatList
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              data={evento.photos.slice(0, 5)}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.heroPhoto} resizeMode="cover" />
              )}
            />
          ) : (
            <CatCover category={evento.category} variant="hero" style={styles.heroPhoto} />
          )}
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(10,8,14,0.7)']} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['top']} style={styles.heroTop}>
            <TouchableOpacity style={styles.roundBtn} onPress={() => router.back()}>
              <ChevronLeft size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.roundBtn} onPress={compartir}><Share2 size={18} color="#fff" /></TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn} onPress={toggleAsistencia}>
                <Heart size={18} color={asistire ? T.danger : '#fff'} fill={asistire ? T.danger : 'none'} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <CategoryPill category={evento.category} />
            <Text style={styles.heroTitle} numberOfLines={2}>{evento.name}</Text>
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{evento.is_free ? 'Gratis' : `Bs. ${evento.price}`}</Text>
            <Text style={styles.attendees}>{totalAsist} asistentes</Text>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Calendar size={18} color={T.primary} />
              <Text style={styles.infoText}>{formatEventDateLong(evento.start_datetime)}</Text>
            </View>
            {lugar && (
              <TouchableOpacity style={styles.infoRow} onPress={() => deferredPush(`/lugares/${lugar.id}`)}>
                <MapPin size={18} color={T.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoText}>{lugar.name}</Text>
                  {lugar.address && <Text style={styles.infoSub}>{lugar.address}</Text>}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {evento.description && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Descripción</Text>
              <Text style={styles.body}>{evento.description}</Text>
            </View>
          )}

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Asistentes</Text>
            {asistentes.length > 0 ? (
              <>
                <AvatarGroup
                  items={asistentes.map(a => ({ id: a.id, initials: a.ini, avatarUrl: a.avatarUrl }))}
                  max={6}
                  size={40}
                />
                <Text style={styles.socialProof}>{totalAsist} personas van a este evento</Text>
              </>
            ) : (
              <Text style={styles.body}>Sé el primero en confirmar asistencia</Text>
            )}
          </View>

          {lugar?.latitude && lugar?.longitude && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Ubicación</Text>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${lugar.latitude},${lugar.longitude}`)}
              >
                <MapPin size={16} color={T.primary} />
                <Text style={styles.mapBtnText}>Abrir en mapa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, S.md) }]}>
        <TouchableOpacity
          style={[styles.cta, asistire && styles.ctaActive]}
          onPress={toggleAsistencia}
          disabled={toggling}
          activeOpacity={0.9}
        >
          <Users size={20} color={asistire ? '#fff' : T.primary} />
          <Text style={[styles.ctaText, asistire && styles.ctaTextActive]}>
            {toggling ? '...' : asistire ? '¡Vas a asistir!' : 'Asistir / Reservar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const HERO_H = 340

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  notFound: { fontFamily: FONT.regular, fontSize: F.size.lg, color: T.fg3 },
  link: { fontFamily: FONT.semibold, color: T.primary },
  heroWrap: { height: HERO_H, backgroundColor: T.muted },
  heroPhoto: { width: SW, height: HERO_H },
  heroTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingTop: S.sm,
  },
  heroActions: { flexDirection: 'row', gap: S.sm },
  roundBtn: {
    width: 40, height: 40, borderRadius: R.full,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: { position: 'absolute', left: S.lg, right: S.lg, bottom: S.xl, gap: S.sm },
  heroTitle: {
    fontFamily: FONT.bold, fontSize: F.size.hero, fontWeight: F.weight.bold, color: '#fff', letterSpacing: -0.5,
  },
  sheet: {
    marginTop: -R.xl,
    backgroundColor: T.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingTop: S.xl,
    paddingHorizontal: S.lg,
    ...SHADOW.lg,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.lg },
  price: { fontFamily: FONT.bold, fontSize: F.size.xxl, color: T.primary },
  attendees: { fontFamily: FONT.semibold, fontSize: F.size.sm, color: T.secondary },
  infoBlock: { gap: S.md, marginBottom: S.xl },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md },
  infoText: { fontFamily: FONT.medium, fontSize: F.size.md, color: T.fg1, flex: 1 },
  infoSub: { fontFamily: FONT.regular, fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  block: { marginBottom: S.xl },
  blockTitle: { fontFamily: FONT.bold, fontSize: F.size.lg, color: T.fg1, marginBottom: S.md },
  body: { fontFamily: FONT.regular, fontSize: F.size.md, color: T.fg2, lineHeight: 22 },
  socialProof: { fontFamily: FONT.semibold, fontSize: F.size.sm, color: T.secondary, marginTop: S.md },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    paddingVertical: S.md, justifyContent: 'center',
    borderWidth: 1.5, borderColor: T.primary, borderRadius: R.xl,
  },
  mapBtnText: { fontFamily: FONT.semibold, fontSize: F.size.md, color: T.primary },
  sticky: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: T.surface,
    paddingHorizontal: S.lg, paddingTop: S.md,
    borderTopWidth: 1, borderTopColor: T.border,
    ...SHADOW.md,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm,
    height: 54, borderRadius: R.xl, backgroundColor: T.purpleSoft,
  },
  ctaActive: { backgroundColor: T.primary },
  ctaText: { fontFamily: FONT.bold, fontSize: F.size.md, color: T.primary },
  ctaTextActive: { color: '#fff' },
})

import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Settings, Share2, Camera, BadgeCheck, User, Store,
  Star, Heart, Bell, Calendar, Users, Pencil, Shield,
  CreditCard, HelpCircle, LogOut, ChevronRight, UserPlus, Plus,
} from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'
import { TrivaiHeader } from '@/components/TrivaiHeader'
import { CatCover } from '@/components/CatCover'

const NIVELES = [
  { min: 0,    max: 49,        nombre: 'Curioso',    emoji: '🌱', color: T.green   },
  { min: 50,   max: 199,       nombre: 'Explorador', emoji: '🗺️', color: T.purple  },
  { min: 200,  max: 499,       nombre: 'Viajero',    emoji: '✈️', color: T.orange  },
  { min: 500,  max: 999,       nombre: 'Aventurero', emoji: '🏆', color: '#E91E63' },
  { min: 1000, max: Infinity,  nombre: 'Embajador',  emoji: '👑', color: '#B8860B' },
]

function getNivel(xp: number) {
  const idx   = NIVELES.findIndex(n => xp >= n.min && xp <= n.max)
  const nivel = NIVELES[Math.max(0, idx)]
  const sig   = NIVELES[idx + 1] ?? null
  const progreso = sig
    ? Math.min(Math.round(((xp - nivel.min) / (sig.min - nivel.min)) * 100), 100)
    : 100
  return { ...nivel, sig, progreso, xpRestante: sig ? sig.min - xp : 0 }
}

const STATS_DEF = [
  { key: 'eventos', label: 'Eventos',  Icon: Calendar, color: T.orange, href: '/perfil/eventos-asistidos' },
  { key: 'lugares', label: 'Lugares',  Icon: Heart,    color: T.green,  href: '/perfil/favoritos'          },
  { key: 'amigos',  label: 'Amigos',   Icon: Users,    color: T.purple, href: '/amigos'                    },
  { key: 'resenas', label: 'Reseñas',  Icon: Star,     color: T.orange, href: '/perfil/resenas'            },
] as const

interface Actividad {
  id: string
  Icon: typeof Star
  color: string
  bg: string
  titulo: string
  sub: string
  fecha: Date
  href: string
}

interface Amigo {
  id: string
  ini: string
  avatarUrl: string | null
  color: string
}

export default function Perfil() {
  const { profile, user, loading, isAuthenticated, displayName, initials, avatarUrl, isBusiness, signOut, refreshProfile } = useUser()
  const [stats,     setStats]     = useState({ eventos: 0, lugares: 0, amigos: 0, resenas: 0 })
  const [favs,      setFavs]      = useState<any[]>([])
  const [actividad, setActividad] = useState<Actividad[]>([])
  const [amigos,    setAmigos]    = useState<Amigo[]>([])

  // Refresca la sesión cada vez que el tab gana foco
  useFocusEffect(
    useCallback(() => {
      refreshProfile()
    }, [refreshProfile])
  )

  useEffect(() => {
    const userId = profile?.id ?? user?.id
    if (!userId) return
    cargarDatos(userId)
  }, [profile?.id, user?.id])

  async function cargarDatos(userId: string) {
    const [
      { data: eventRows },
      { count: cLugares },
      { data: amigosEnv },
      { data: amigosRec },
      { count: cResenas },
      { data: favsData },
      { data: resenasData },
    ] = await Promise.all([
      supabase.from('event_attendees').select('created_at, event:events(id,name)').eq('user_id', userId).eq('status', 'going').order('created_at', { ascending: false }).limit(5),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('friendships').select('friend_id').eq('user_id', userId).eq('status', 'accepted'),
      supabase.from('friendships').select('user_id').eq('friend_id', userId).eq('status', 'accepted'),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('favorites').select('created_at, place:places(id, name, category)').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
      supabase.from('reviews').select('id, rating, created_at, place:places(id, name, category)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ])

    const eventosOk = (eventRows ?? []).filter((r: any) => r.event?.id)
    const friendIds = [...new Set([
      ...(amigosEnv ?? []).map((f: any) => f.friend_id),
      ...(amigosRec ?? []).map((f: any) => f.user_id),
    ])]

    setStats({
      eventos: eventosOk.length,
      lugares: cLugares ?? 0,
      amigos:  friendIds.length,
      resenas: cResenas ?? 0,
    })
    setFavs(favsData ?? [])

    // Actividad reciente: mezcla de asistencias, favoritos y reseñas
    const items: Actividad[] = [
      ...eventosOk.map((r: any) => ({
        id:     'ev-' + r.event.id,
        Icon:   Calendar,
        color:  T.orange,
        bg:     T.orangeSoft,
        titulo: 'Asistirás a ' + r.event.name,
        sub:    fechaRelativa(r.created_at),
        fecha:  new Date(r.created_at),
        href:   `/eventos/${r.event.id}`,
      })),
      ...(favsData ?? []).filter((f: any) => f.place?.id).map((f: any) => ({
        id:     'fav-' + f.place.id,
        Icon:   Heart,
        color:  T.green,
        bg:     T.greenSoft,
        titulo: 'Guardaste ' + f.place.name,
        sub:    fechaRelativa(f.created_at),
        fecha:  new Date(f.created_at),
        href:   `/lugares/${f.place.id}`,
      })),
      ...(resenasData ?? []).filter((r: any) => r.place?.id).map((r: any) => ({
        id:     'res-' + r.id,
        Icon:   Star,
        color:  T.purple,
        bg:     T.purpleSoft,
        titulo: `Reseñaste ${r.place.name} (${'★'.repeat(r.rating)})`,
        sub:    fechaRelativa(r.created_at),
        fecha:  new Date(r.created_at),
        href:   `/lugares/${r.place.id}`,
      })),
    ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 4)
    setActividad(items)

    // Vista previa de amigos (avatares superpuestos)
    if (friendIds.length > 0) {
      const { data: perfiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', friendIds.slice(0, 5))
      const COLORES = [T.purpleSoft, T.orangeSoft, T.greenSoft, T.muted]
      setAmigos((perfiles ?? []).map((p: any, i: number) => ({
        id:        p.id,
        ini:       (p.full_name ?? p.username ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        avatarUrl: p.avatar_url ?? null,
        color:     COLORES[i % 4],
      })))
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
  }

  const xp    = profile?.xp_points ?? 0
  const nivel = getNivel(xp)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* 1. HEADER */}
      <TrivaiHeader
        title="Perfil"
        left={isAuthenticated ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => Share.share({ title: 'Trivai', message: 'Descubre Santa Cruz con Trivai 🌆' })}
          >
            <Share2 size={18} color={T.fg2} strokeWidth={1.75} />
          </TouchableOpacity>
        ) : undefined}
        right={isAuthenticated ? (
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/perfil/configuracion')}>
            <Settings size={20} color={T.fg2} strokeWidth={1.75} />
          </TouchableOpacity>
        ) : undefined}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* BANNER solo si no hay sesión */}
        {!isAuthenticated && (
          <TouchableOpacity style={styles.loginBanner} onPress={() => router.push('/auth')}>
            <User size={16} color={T.purple} />
            <Text style={styles.loginBannerText}>Inicia sesión para personalizar tu perfil</Text>
            <ChevronRight size={16} color={T.purple} />
          </TouchableOpacity>
        )}

        {/* 2. PROFILE CARD */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={{ position: 'relative' }}
            onPress={() => isAuthenticated && router.push('/perfil/editar')}
          >
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              : <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            }
            {isAuthenticated && (
              <View style={styles.cameraBtn}>
                <Camera size={13} color={T.purple} strokeWidth={2} />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md }}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            {isAuthenticated && <BadgeCheck size={18} color={T.purple} fill={T.purple} strokeWidth={0} />}
          </View>
          <Text style={styles.username}>@{profile?.username || 'usuario'}</Text>
          <Text style={styles.bio} numberOfLines={2}>
            {profile?.bio || 'Amante de la música, el arte y los buenos planes. 💜'}
          </Text>
          <Text style={styles.city}>{profile?.city || 'Santa Cruz, Bolivia'}</Text>

          {/* Nivel XP integrado */}
          <View style={styles.xpRow}>
            <Text style={{ fontSize: 14 }}>{nivel.emoji}</Text>
            <Text style={[styles.xpText, { color: nivel.color }]}>Nivel {nivel.nombre}</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBar, { width: `${nivel.progreso}%` as any, backgroundColor: nivel.color }]} />
            </View>
            <Text style={styles.xpPoints}>{xp} XP</Text>
          </View>

          {isAuthenticated && (
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/perfil/editar')} activeOpacity={0.8}>
              <Pencil size={14} color={T.purple} strokeWidth={2} />
              <Text style={styles.editBtnText}>Editar perfil</Text>
            </TouchableOpacity>
          )}

          {/* 3. STATS */}
          <View style={styles.statsRow}>
            {STATS_DEF.map((s, i) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.statItem, i < STATS_DEF.length - 1 && styles.statDivider]}
                onPress={() => isAuthenticated && router.push(s.href as any)}
                activeOpacity={0.7}
              >
                <s.Icon size={15} color={s.color} strokeWidth={2} />
                <Text style={styles.statValue}>{stats[s.key]}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. BOTONES DE ACCIÓN */}
        {isAuthenticated && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/publicar')} activeOpacity={0.85}>
              <Plus size={16} color="#fff" strokeWidth={2.5} />
              <Text style={styles.btnPrimaryText}>Crear plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/amigos')} activeOpacity={0.85}>
              <UserPlus size={16} color={T.purple} strokeWidth={2} />
              <Text style={styles.btnSecondaryText}>Invitar amigos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MI NEGOCIO */}
        {isBusiness && (
          <TouchableOpacity style={styles.negocioCard} onPress={() => router.push('/perfil/mi-negocio')}>
            <View style={styles.negocioIcon}><Store size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.negocioTitle}>Mi negocio</Text>
              <Text style={styles.negocioSub}>Editar fotos, descripción, teléfono y más</Text>
            </View>
            <ChevronRight size={18} color={T.purple} strokeWidth={2} />
          </TouchableOpacity>
        )}

        {/* 5. ACTIVIDAD RECIENTE */}
        {actividad.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            <View style={styles.card}>
              {actividad.map((a, idx) => (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.actividadRow, idx < actividad.length - 1 && styles.rowBorder]}
                  onPress={() => router.push(a.href as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actividadIcon, { backgroundColor: a.bg }]}>
                    <a.Icon size={15} color={a.color} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.actividadTitulo} numberOfLines={1}>{a.titulo}</Text>
                    <Text style={styles.actividadSub}>{a.sub}</Text>
                  </View>
                  <ChevronRight size={16} color={T.fg4} strokeWidth={1.5} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 6. FAVORITOS */}
        {favs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favoritos</Text>
              <TouchableOpacity onPress={() => router.push('/perfil/favoritos')}>
                <Text style={styles.sectionAction}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
              {favs.map((f: any, i: number) => {
                const p = f.place; if (!p) return null
                return (
                  <TouchableOpacity key={p.id ?? i} style={styles.favCard} onPress={() => router.push(`/lugares/${p.id}`)} activeOpacity={0.85}>
                    <CatCover category={p.category} variant="banner" style={{ height: 80 }} />
                    <Text style={styles.favNombre} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.favCat} numberOfLines={1}>{p.category}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* 7. AMIGOS */}
        {amigos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Amigos</Text>
              <TouchableOpacity onPress={() => router.push('/amigos')}>
                <Text style={styles.sectionAction}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.amigosCard} onPress={() => router.push('/amigos')} activeOpacity={0.85}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {amigos.map((a, i) => (
                  <View key={a.id} style={[styles.amigoAvatar, { backgroundColor: a.color, marginLeft: i === 0 ? 0 : -12, zIndex: 5 - i }]}>
                    {a.avatarUrl
                      ? <Image source={{ uri: a.avatarUrl }} style={styles.amigoAvatarImg} />
                      : <Text style={styles.amigoIni}>{a.ini}</Text>}
                  </View>
                ))}
              </View>
              <Text style={styles.amigosText}>
                {stats.amigos} amigo{stats.amigos !== 1 ? 's' : ''} en Trivai
              </Text>
              <ChevronRight size={16} color={T.fg4} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        )}

        {/* 8. OPCIONES */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones</Text>
            <View style={styles.card}>
              <SettingsItem Icon={Pencil}     label="Editar perfil"   onPress={() => router.push('/perfil/editar')} />
              <SettingsItem Icon={Bell}       label="Notificaciones"  onPress={() => router.push('/notificaciones')} />
              <SettingsItem Icon={Shield}     label="Privacidad"      onPress={() => router.push('/perfil/configuracion')} />
              <SettingsItem Icon={CreditCard} label="Métodos de pago" soon />
              <SettingsItem Icon={HelpCircle} label="Ayuda"           soon />
              <SettingsItem
                Icon={LogOut}
                label="Cerrar sesión"
                danger
                last
                onPress={async () => { await signOut(); router.replace('/') }}
              />
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

function fechaRelativa(dt: string) {
  const dias = Math.floor((Date.now() - new Date(dt).getTime()) / 86400000)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7)  return `Hace ${dias} días`
  return new Date(dt).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
}

function SettingsItem({ Icon, label, onPress, danger = false, soon = false, last = false }: {
  Icon: typeof Star
  label: string
  onPress?: () => void
  danger?: boolean
  soon?: boolean
  last?: boolean
}) {
  const color = danger ? T.danger : T.fg2
  return (
    <TouchableOpacity
      style={[styles.opcionRow, !last && styles.rowBorder, soon && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={soon}
      activeOpacity={0.7}
    >
      <View style={[styles.opcionIcon, { backgroundColor: danger ? T.dangerSoft : T.muted }]}>
        <Icon size={15} color={color} strokeWidth={2} />
      </View>
      <Text style={[styles.opcionLabel, danger && { color: T.danger }]}>{label}</Text>
      {soon
        ? <Text style={styles.soonBadge}>Próximamente</Text>
        : <ChevronRight size={16} color={T.fg4} strokeWidth={1.5} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: '#FFFFFF' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  iconBtn:        { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  // Banner login
  loginBanner:    { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.purpleSoft, paddingHorizontal: S.lg, paddingVertical: S.md },
  loginBannerText:{ flex: 1, fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  // Profile card
  profileCard:    { alignItems: 'center', marginHorizontal: S.lg, marginTop: S.lg, backgroundColor: T.surface, borderRadius: R.xl, padding: S.xl, shadowColor: '#15131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  avatarImg:      { width: 96, height: 96, borderRadius: 48 },
  avatar:         { width: 96, height: 96, borderRadius: 48, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 34, fontWeight: F.weight.bold, color: '#fff' },
  cameraBtn:      { position: 'absolute', right: -2, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  name:           { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.4 },
  username:       { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  bio:            { fontSize: F.size.sm, color: T.fg2, marginTop: S.sm, lineHeight: 20, textAlign: 'center' },
  city:           { fontSize: F.size.xs, color: T.fg3, marginTop: 4 },
  // XP
  xpRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md, alignSelf: 'stretch' },
  xpText:         { fontSize: F.size.xs, fontWeight: F.weight.bold },
  xpBarBg:        { flex: 1, height: 5, backgroundColor: T.muted, borderRadius: R.full },
  xpBar:          { height: '100%', borderRadius: R.full },
  xpPoints:       { fontSize: F.size.xs, color: T.fg3, fontWeight: F.weight.semibold },
  editBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md, paddingHorizontal: S.xl, paddingVertical: 9, borderRadius: R.full, backgroundColor: T.purpleSoft },
  editBtnText:    { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  // Stats
  statsRow:       { flexDirection: 'row', alignSelf: 'stretch', marginTop: S.lg, paddingTop: S.lg, borderTopWidth: 1, borderTopColor: T.border },
  statItem:       { flex: 1, alignItems: 'center', gap: 3 },
  statDivider:    { borderRightWidth: 1, borderRightColor: T.border },
  statValue:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  statLabel:      { fontSize: 10, color: T.fg3 },
  // Acciones
  actionsRow:     { flexDirection: 'row', gap: S.sm, marginHorizontal: S.lg, marginTop: S.lg },
  btnPrimary:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: T.orange, paddingVertical: 13, borderRadius: R.full, shadowColor: T.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  btnPrimaryText: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  btnSecondary:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: T.purpleSoft, paddingVertical: 13, borderRadius: R.full },
  btnSecondaryText:{ fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  // Negocio
  negocioCard:    { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.purpleSoft, marginHorizontal: S.lg, marginTop: S.lg, borderRadius: R.xl, padding: S.md },
  negocioIcon:    { width: 44, height: 44, borderRadius: R.md, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  negocioTitle:   { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.purpleInk },
  negocioSub:     { fontSize: F.size.xs, color: T.purpleInk, opacity: 0.7, marginTop: 2 },
  // Secciones
  section:        { paddingHorizontal: S.lg, marginTop: S.xxl },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:   { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.3, marginBottom: S.md },
  sectionAction:  { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold, marginBottom: S.md },
  card:           { backgroundColor: T.surface, borderRadius: R.xl, shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: T.border },
  // Actividad
  actividadRow:   { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  actividadIcon:  { width: 34, height: 34, borderRadius: R.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actividadTitulo:{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1 },
  actividadSub:   { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  // Favoritos
  favCard:        { width: 140, backgroundColor: T.surface, borderRadius: R.lg, overflow: 'hidden', shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  favNombre:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, paddingHorizontal: S.sm, paddingTop: S.sm },
  favCat:         { fontSize: F.size.xs, color: T.fg3, paddingHorizontal: S.sm, paddingBottom: S.sm },
  // Amigos
  amigosCard:     { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.xl, padding: S.lg, shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  amigoAvatar:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  amigoAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  amigoIni:       { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg1 },
  amigosText:     { flex: 1, fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  // Opciones
  opcionRow:      { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: 13 },
  opcionIcon:     { width: 32, height: 32, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  opcionLabel:    { flex: 1, fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg1 },
  soonBadge:      { fontSize: 10, color: T.fg3, backgroundColor: T.muted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full, overflow: 'hidden' },
})

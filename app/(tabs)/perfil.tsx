import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, Share,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  LogOut, Settings, Share2, Pencil, Camera, BadgeCheck,
  MapPin, Star, Heart, Ticket, Bell, Store, Calendar, Bookmark, Users,
  ChevronRight,
} from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

const STAT_TILES = [
  { key: 'eventos', label: 'Eventos\nasistidos', Icon: Calendar, bg: T.greenSoft,   fg: T.green,   href: '/perfil/eventos-asistidos' },
  { key: 'lugares', label: 'Lugares\nguardados', Icon: Bookmark, bg: T.orangeSoft,  fg: T.orange,  href: '/perfil/favoritos'          },
  { key: 'amigos',  label: 'Amigos',             Icon: Users,    bg: T.purpleSoft,  fg: T.purple,  href: '/amigos'                    },
  { key: 'resenas', label: 'Reseñas',            Icon: Star,     bg: T.dangerSoft,  fg: T.danger,  href: '/perfil/resenas'            },
] as const

const OPCIONES = [
  { label: 'Mis entradas',   Icon: Ticket, bg: T.purpleSoft, fg: T.purple, href: '/perfil/eventos-asistidos' },
  { label: 'Mis favoritos',  Icon: Heart,  bg: T.dangerSoft, fg: T.danger, href: '/perfil/favoritos'          },
  { label: 'Notificaciones', Icon: Bell,   bg: T.greenSoft,  fg: T.green,  href: '/notificaciones'            },
] as const

export default function Perfil() {
  const { profile, user, loading, isAuthenticated, displayName, initials, avatarUrl, isBusiness, signOut } = useUser()
  const [stats,   setStats]   = useState({ eventos: 0, lugares: 0, amigos: 0, resenas: 0 })
  const [favs,    setFavs]    = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  useEffect(() => {
    const userId = profile?.id ?? user?.id
    if (!userId) return
    cargarDatos(userId)
  }, [profile?.id, user?.id])

  async function cargarDatos(userId: string) {
    const [
      { data: eventRows },
      { count: cLugares },
      { count: cAmigos  },
      { count: cResenas },
      { data: favsData  },
      { data: resenasData },
    ] = await Promise.all([
      supabase.from('event_attendees').select('event:events(id)').eq('user_id', userId).eq('status', 'going'),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('friendships').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'accepted'),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('favorites').select('place:places(id, name, category)').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
      supabase.from('reviews').select('id, rating, text, created_at, place:places(id, name, category)').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
    ])
    const cEventos = eventRows ? eventRows.filter((r: any) => r.event?.id).length : 0
    setStats({ eventos: cEventos, lugares: cLugares ?? 0, amigos: cAmigos ?? 0, resenas: cResenas ?? 0 })
    setFavs(favsData ?? [])
    setResenas(resenasData ?? [])
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* HEADER */}
      <View style={styles.header}>
        {isAuthenticated
          ? <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/perfil/configuracion')}>
              <Settings size={20} color={T.fg1} strokeWidth={1.75} />
            </TouchableOpacity>
          : <View style={{ width: 36 }} />
        }
        {isAuthenticated && (
          <View style={{ flexDirection: 'row', gap: S.sm }}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Share.share({ title: 'Trivai', message: 'Descubre Santa Cruz con Trivai 🌆' })}
            >
              <Share2 size={18} color={T.fg1} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/perfil/editar')}>
              <Pencil size={18} color={T.fg1} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* BANNER solo si no hay sesión */}
        {!isAuthenticated && (
          <TouchableOpacity style={styles.loginBanner} onPress={() => router.push('/auth')}>
            <User size={16} color={T.purple} />
            <Text style={styles.loginBannerText}>Inicia sesión para personalizar tu perfil</Text>
            <ChevronRight size={16} color={T.purple} />
          </TouchableOpacity>
        )}

        {/* HERO */}
        <View style={styles.hero}>
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

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              {isAuthenticated && <BadgeCheck size={18} color={T.purple} fill={T.purple} strokeWidth={0} />}
            </View>
            <Text style={styles.username}>@{profile?.username || 'usuario'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <MapPin size={13} color={T.fg2} strokeWidth={1.5} />
              <Text style={styles.city}>{profile?.city || 'Santa Cruz, Bolivia'}</Text>
            </View>
            <Text style={styles.bio} numberOfLines={3}>
              {profile?.bio || 'Amante de la música, el arte y los buenos planes. 💜'}
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          {STAT_TILES.map((s, i) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.statTile, i < STAT_TILES.length - 1 && styles.statTileBorder]}
              onPress={() => isAuthenticated && router.push(s.href as any)}
            >
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <s.Icon size={16} color={s.fg} strokeWidth={2} />
              </View>
              <Text style={styles.statValue}>{stats[s.key]}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NIVEL EXPLORADOR */}
        <TouchableOpacity style={styles.xpCard} onPress={() => router.push('/publicar')}>
          <View style={styles.xpHex}>
            <Star size={20} color="#fff" fill="#fff" strokeWidth={0} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.xpTitle}>Nivel Explorador</Text>
            <Text style={styles.xpSub}>Sigue descubriendo y sumando experiencias</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBar, { width: `${Math.min((profile?.xp_points ?? 0) / 10, 100)}%` as any }]} />
            </View>
          </View>
          <Text style={styles.xpPoints}>{profile?.xp_points ?? 0} / 1k XP</Text>
        </TouchableOpacity>

        {/* MIS FAVORITOS */}
        {favs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis favoritos</Text>
              <TouchableOpacity onPress={() => router.push('/perfil/favoritos')}>
                <Text style={styles.sectionAction}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
              {favs.map((f: any, i: number) => {
                const p = f.place; if (!p) return null
                return (
                  <TouchableOpacity key={p.id ?? i} style={styles.favCard} onPress={() => router.push(`/lugares/${p.id}`)}>
                    <View style={styles.favIcon}><Text style={{ fontSize: 28 }}>{getCatEmoji(p.category)}</Text></View>
                    <Text style={styles.favNombre} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.favCat} numberOfLines={1}>{p.category}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        )}

        {/* MIS RESEÑAS */}
        {resenas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mis reseñas</Text>
              <TouchableOpacity onPress={() => router.push('/perfil/resenas')}>
                <Text style={styles.sectionAction}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {resenas.map((r: any) => {
              const place = r.place
              const fecha = new Date(r.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' })
              return (
                <TouchableOpacity key={r.id} style={styles.resenaRow} onPress={() => router.push(place ? `/lugares/${place.id}` : '/lugares')}>
                  <View style={styles.resenaIcon}>
                    <Text style={{ fontSize: 20 }}>{getCatEmoji(place?.category ?? '')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.resenaNombre} numberOfLines={1}>{place?.name ?? 'Lugar'}</Text>
                      <Text style={styles.resenaFecha}>{fecha}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} color={i <= r.rating ? T.orange : T.border} fill={i <= r.rating ? T.orange : 'transparent'} strokeWidth={1} />
                      ))}
                    </View>
                    {r.text ? <Text style={styles.resenaTexto} numberOfLines={2}>{r.text}</Text> : null}
                  </View>
                </TouchableOpacity>
              )
            })}
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

        {/* OPCIONES (solo si hay sesión) */}
        {isAuthenticated && (
          <View style={styles.opcionesCard}>
            {OPCIONES.map((op, idx) => (
              <TouchableOpacity
                key={op.label}
                style={[styles.opcionRow, idx < OPCIONES.length - 1 && styles.opcionBorder]}
                onPress={() => router.push(op.href as any)}
              >
                <View style={[styles.opcionIcon, { backgroundColor: op.bg }]}>
                  <op.Icon size={16} color={op.fg} strokeWidth={2} />
                </View>
                <Text style={styles.opcionLabel}>{op.label}</Text>
                <ChevronRight size={18} color={T.fg3} strokeWidth={1.5} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CERRAR SESIÓN / INICIAR SESIÓN */}
        <View style={styles.logoutWrap}>
          {isAuthenticated
            ? (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => { await signOut(); router.replace('/') }}
              >
                <Text style={{ fontSize: 18 }}>🚪</Text>
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.loginBtnText}>Iniciar sesión</Text>
              </TouchableOpacity>
            )
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: T.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
  // Header
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  iconBtn:        { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  // Banner login
  loginBanner:    { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.purpleSoft, paddingHorizontal: S.lg, paddingVertical: S.md },
  loginBannerText:{ flex: 1, fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  // Hero
  hero:           { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, padding: S.md, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  avatarImg:      { width: 104, height: 104, borderRadius: 52 },
  avatar:         { width: 104, height: 104, borderRadius: 52, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 36, fontWeight: F.weight.bold, color: '#fff' },
  cameraBtn:      { position: 'absolute', right: -2, bottom: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  name:           { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.4, flex: 1 },
  username:       { fontSize: F.size.sm, color: T.fg2 },
  city:           { fontSize: F.size.sm, color: T.fg2 },
  bio:            { fontSize: F.size.sm, color: T.fg2, marginTop: S.sm, lineHeight: 20 },
  // Stats
  statsRow:       { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  statTile:       { flex: 1, alignItems: 'center', paddingVertical: S.md, gap: 4 },
  statTileBorder: { borderRightWidth: 1, borderRightColor: T.border },
  statIcon:       { width: 32, height: 32, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  statLabel:      { fontSize: 9, color: T.fg3, textAlign: 'center', lineHeight: 12 },
  // XP
  xpCard:         { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: T.border },
  xpHex:          { width: 46, height: 50, backgroundColor: T.purple, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  xpTitle:        { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  xpSub:          { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  xpBarBg:        { height: 6, backgroundColor: T.purpleSoft, borderRadius: R.full, marginTop: S.sm },
  xpBar:          { height: '100%', backgroundColor: T.purple, borderRadius: R.full },
  xpPoints:       { fontSize: F.size.xs, fontWeight: F.weight.semibold, color: T.fg3, flexShrink: 0 },
  // Sections
  section:        { paddingHorizontal: S.lg, paddingTop: S.lg },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:   { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:  { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  favCard:        { width: 140, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  favIcon:        { height: 80, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  favNombre:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, paddingHorizontal: S.sm, paddingTop: S.sm },
  favCat:         { fontSize: F.size.xs, color: T.fg3, paddingHorizontal: S.sm, paddingBottom: S.sm },
  resenaRow:      { flexDirection: 'row', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  resenaIcon:     { width: 64, height: 64, borderRadius: R.md, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resenaNombre:   { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, flex: 1 },
  resenaFecha:    { fontSize: 10, color: T.fg3 },
  resenaTexto:    { fontSize: F.size.xs, color: T.fg2, marginTop: 4, lineHeight: 16 },
  // Negocio
  negocioCard:    { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.purpleSoft, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, padding: S.md },
  negocioIcon:    { width: 44, height: 44, borderRadius: R.md, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  negocioTitle:   { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.purpleInk },
  negocioSub:     { fontSize: F.size.xs, color: T.purpleInk, opacity: 0.7, marginTop: 2 },
  // Opciones
  opcionesCard:   { backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, borderWidth: 1, borderColor: T.border },
  opcionRow:      { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  opcionBorder:   { borderBottomWidth: 1, borderBottomColor: T.border },
  opcionIcon:     { width: 32, height: 32, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  opcionLabel:    { flex: 1, fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg1 },
  // Logout / Login
  logoutWrap:      { marginHorizontal: S.lg, marginTop: S.md },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.md, borderRadius: R.lg, borderWidth: 1, borderColor: T.dangerSoft, backgroundColor: T.dangerSoft },
  logoutText:      { fontSize: F.size.md, color: T.danger, fontWeight: F.weight.semibold },
  loginBtn:        { height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  loginBtnText:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: '#fff' },
})

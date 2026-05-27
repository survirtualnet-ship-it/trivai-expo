import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  LogOut, Settings, Star, Heart, Ticket, Bell, Store,
  MapPin, ChevronRight, Pencil, User,
} from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

type Stats = { eventos: number; lugares: number; amigos: number; resenas: number }

export default function Perfil() {
  const { profile, loading, displayName, initials, isBusiness, signOut } = useUser()
  const [stats,   setStats]   = useState<Stats>({ eventos: 0, lugares: 0, amigos: 0, resenas: 0 })
  const [favs,    setFavs]    = useState<any[]>([])
  const [resenas, setResenas] = useState<any[]>([])

  useEffect(() => {
    if (!profile) return
    cargarDatos(profile.id)
  }, [profile?.id])

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

  // GUEST
  if (!profile) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIcon}><User size={40} color={T.fg4} /></View>
          <Text style={styles.guestTitle}>¡Únete a Trivai!</Text>
          <Text style={styles.guestSub}>
            Inicia sesión para guardar tus lugares favoritos, dejar reseñas y conectar con amigos.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/auth')}>
            <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/auth/registro')}>
            <Text style={styles.btnSecondaryText}>Crear cuenta gratis</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const opciones = [
    { icon: Ticket,   label: 'Mis entradas',       sub: `${stats.eventos} eventos`, tone: T.purple, href: '/perfil/eventos-asistidos' },
    { icon: Heart,    label: 'Mis favoritos',       sub: `${stats.lugares} guardados`, tone: T.orange, href: '/perfil/favoritos' },
    { icon: Bell,     label: 'Notificaciones',      sub: '',                          tone: T.green,  href: '/notificaciones' },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <View style={{ flexDirection: 'row', gap: S.sm }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/perfil/editar')}>
            <Pencil size={18} color={T.fg2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/perfil/configuracion')}>
            <Settings size={18} color={T.fg2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.full_name || displayName}</Text>
          {profile.username ? <Text style={styles.username}>@{profile.username}</Text> : null}
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          {isBusiness && (
            <View style={styles.businessBadge}>
              <Text style={styles.businessBadgeText}>🏢 Cuenta Empresa</Text>
            </View>
          )}
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          {[
            { label: 'Eventos',   value: stats.eventos, href: '/perfil/eventos-asistidos' },
            { label: 'Favoritos', value: stats.lugares, href: '/perfil/favoritos'          },
            { label: 'Amigos',    value: stats.amigos,  href: '/amigos'                    },
            { label: 'Reseñas',   value: stats.resenas, href: '/perfil/resenas'            },
          ].map((s, i) => (
            <TouchableOpacity key={s.label} style={[styles.stat, i < 3 && styles.statBorder]} onPress={() => router.push(s.href as any)}>
              <Text style={styles.statValue}>{s.value}</Text>
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
              <View style={[styles.xpBar, { width: `${Math.min((profile.xp_points ?? 750) / 10, 100)}%` }]} />
            </View>
          </View>
          <Text style={styles.xpPoints}>{profile.xp_points ?? 750} / 1k XP</Text>
        </TouchableOpacity>

        {/* MI NEGOCIO */}
        {isBusiness && (
          <TouchableOpacity style={styles.negocioCard} onPress={() => {}}>
            <View style={styles.negocioIcon}><Store size={22} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.negocioTitle}>Mi negocio</Text>
              <Text style={styles.negocioSub}>Editar fotos, descripción, teléfono y más</Text>
            </View>
            <ChevronRight size={18} color={T.purple} />
          </TouchableOpacity>
        )}

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
              {favs.map((f: any) => {
                const p = f.place; if (!p) return null
                return (
                  <TouchableOpacity key={p.id} style={styles.favCard} onPress={() => router.push(`/lugares/${p.id}`)}>
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
                  <View style={styles.resenaIcon}><Text style={{ fontSize: 20 }}>{getCatEmoji(place?.category ?? '')}</Text></View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.resenaNombre}>{place?.name ?? 'Lugar'}</Text>
                      <Text style={styles.resenaFecha}>{fecha}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 1 }}>
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

        {/* OPCIONES */}
        <View style={styles.opcionesCard}>
          {opciones.map((op, idx) => (
            <TouchableOpacity key={op.label} style={[styles.opcionRow, idx < opciones.length - 1 && styles.opcionBorder]} onPress={() => router.push(op.href as any)}>
              <View style={[styles.opcionIcon, { backgroundColor: op.tone + '22' }]}>
                <op.icon size={16} color={op.tone} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.opcionLabel}>{op.label}</Text>
                {op.sub ? <Text style={styles.opcionSub}>{op.sub}</Text> : null}
              </View>
              <ChevronRight size={18} color={T.fg4} strokeWidth={1.5} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => { await signOut(); router.replace('/auth') }}
        >
          <LogOut size={18} color={T.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:             { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  iconBtn:           { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  // Guest
  guestContainer:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl, gap: S.md },
  guestIcon:         { width: 80, height: 80, borderRadius: 40, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  guestTitle:        { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  guestSub:          { fontSize: F.size.base, color: T.fg3, textAlign: 'center', lineHeight: 22, maxWidth: 300, marginBottom: S.md },
  btnPrimary:        { width: '100%', height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText:    { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  btnSecondary:      { width: '100%', height: 52, borderRadius: R.lg, borderWidth: 2, borderColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText:  { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.purple },
  // Hero
  hero:              { alignItems: 'center', paddingVertical: S.xl, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, paddingHorizontal: S.lg },
  avatar:            { width: 88, height: 88, borderRadius: 44, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  avatarText:        { fontSize: 32, fontWeight: F.weight.bold, color: '#fff' },
  name:              { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  username:          { fontSize: F.size.base, color: T.fg3, marginTop: 4 },
  bio:               { fontSize: F.size.sm, color: T.fg2, textAlign: 'center', marginTop: S.sm, lineHeight: 20, maxWidth: 280 },
  businessBadge:     { marginTop: S.sm, paddingHorizontal: S.md, paddingVertical: 4, backgroundColor: T.purpleSoft, borderRadius: R.full },
  businessBadgeText: { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  // Stats
  statsRow:          { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  stat:              { flex: 1, alignItems: 'center', paddingVertical: S.lg },
  statBorder:        { borderRightWidth: 1, borderRightColor: T.border },
  statValue:         { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  statLabel:         { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  // XP
  xpCard:            { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: T.border },
  xpHex:             { width: 44, height: 50, backgroundColor: T.purple, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  xpTitle:           { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  xpSub:             { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  xpBarBg:           { height: 6, backgroundColor: T.purpleSoft, borderRadius: R.full, marginTop: S.sm },
  xpBar:             { height: '100%', backgroundColor: T.purple, borderRadius: R.full },
  xpPoints:          { fontSize: F.size.xs, fontWeight: F.weight.semibold, color: T.fg3 },
  // Negocio
  negocioCard:       { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.purpleSoft, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, padding: S.md },
  negocioIcon:       { width: 44, height: 44, borderRadius: R.md, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  negocioTitle:      { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.purpleInk },
  negocioSub:        { fontSize: F.size.xs, color: T.purpleInk, opacity: 0.7, marginTop: 2 },
  // Secciones
  section:           { paddingHorizontal: S.lg, paddingTop: S.lg },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  favCard:           { width: 140, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  favIcon:           { height: 80, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  favNombre:         { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, paddingHorizontal: S.sm, paddingTop: S.sm },
  favCat:            { fontSize: F.size.xs, color: T.fg3, paddingHorizontal: S.sm, paddingBottom: S.sm },
  resenaRow:         { flexDirection: 'row', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  resenaIcon:        { width: 56, height: 56, borderRadius: R.md, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resenaNombre:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, flex: 1 },
  resenaFecha:       { fontSize: 10, color: T.fg3 },
  resenaTexto:       { fontSize: F.size.xs, color: T.fg2, marginTop: 4, lineHeight: 16 },
  // Opciones
  opcionesCard:      { backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.lg, borderWidth: 1, borderColor: T.border },
  opcionRow:         { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  opcionBorder:      { borderBottomWidth: 1, borderBottomColor: T.border },
  opcionIcon:        { width: 32, height: 32, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  opcionLabel:       { fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg1 },
  opcionSub:         { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  // Logout
  logoutBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.xl, marginTop: S.md, paddingVertical: S.md, borderRadius: R.lg, borderWidth: 1.5, borderColor: T.dangerSoft, backgroundColor: T.dangerSoft },
  logoutText:        { fontSize: F.size.md, color: T.danger, fontWeight: F.weight.semibold },
})

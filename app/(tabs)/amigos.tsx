import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, Plus, UserCheck, UserPlus, Users } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'
import { grantXP, XP } from '@/lib/xp'
import { crearNotificacion } from '@/lib/notify'

type Tab = 'todos' | 'amigos' | 'solicitudes'

type Amigo = {
  id: string
  nombre: string
  usuario: string
  initials: string
  colorIdx: number
}

type Solicitud = {
  id: string       // friendship row id
  uid: string      // sender's user id
  nombre: string
  usuario: string
  initials: string
  colorIdx: number
}

type Sugerencia = {
  id: string
  nombre: string
  usuario: string
  initials: string
  colorIdx: number
}

type Lider = {
  id: string
  nombre: string
  initials: string
  xp: number
  colorIdx: number
}

function nivelEmoji(xp: number) {
  if (xp >= 1000) return '👑'
  if (xp >= 500)  return '🏆'
  if (xp >= 200)  return '✈️'
  if (xp >= 50)   return '🗺️'
  return '🌱'
}

function nivelNombre(xp: number) {
  if (xp >= 1000) return 'Embajador'
  if (xp >= 500)  return 'Aventurero'
  if (xp >= 200)  return 'Viajero'
  if (xp >= 50)   return 'Explorador'
  return 'Curioso'
}

const COLORS = [T.greenSoft, T.orangeSoft, T.purpleSoft, T.muted]
const TEXTS  = [T.greenInk,  T.orange,     T.purple,     T.fg2  ]

function Avatar({ nombre, colorIdx, size = 48 }: { nombre: string; colorIdx: number; size?: number }) {
  const ini = nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS[colorIdx % 4], alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.34, fontWeight: F.weight.bold, color: TEXTS[colorIdx % 4] }}>{ini}</Text>
    </View>
  )
}

export default function Amigos() {
  const [tab,           setTab]           = useState<Tab>('todos')
  const [miId,          setMiId]          = useState<string | null>(null)
  const [amigos,        setAmigos]        = useState<Amigo[]>([])
  const [solicitudes,   setSolicitudes]   = useState<Solicitud[]>([])
  const [sugerencias,   setSugerencias]   = useState<Sugerencia[]>([])
  const [loading,       setLoading]       = useState(true)
  const [enviados,      setEnviados]      = useState<Set<string>>(new Set())
  const [procesando,    setProcesando]    = useState<string | null>(null)
  const [ranking,       setRanking]       = useState<Lider[]>([])

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const me = session?.user?.id ?? null
    setMiId(me)
    if (!me) { setLoading(false); return }

    // Amigos aceptados (en ambas direcciones)
    const [{ data: sent }, { data: recv }] = await Promise.all([
      supabase.from('friendships').select('friend:profiles!friend_id(id, full_name, username)').eq('user_id', me).eq('status', 'accepted'),
      supabase.from('friendships').select('user:profiles!user_id(id, full_name, username)').eq('friend_id', me).eq('status', 'accepted'),
    ])

    const amigosSent = (sent ?? []).filter((d: any) => d.friend?.id).map((d: any, i: number) => toAmigo(d.friend, i))
    const amigosRecv = (recv ?? []).filter((d: any) => d.user?.id).map((d: any, i: number) => toAmigo(d.user, amigosSent.length + i))
    // Deduplicar
    const amigosIds = new Set(amigosSent.map(a => a.id))
    const amigosList = [...amigosSent, ...amigosRecv.filter(a => !amigosIds.has(a.id))]
    setAmigos(amigosList)

    // Solicitudes recibidas pendientes
    const { data: solRaw } = await supabase
      .from('friendships')
      .select('id, user:profiles!user_id(id, full_name, username)')
      .eq('friend_id', me)
      .eq('status', 'pending')
    setSolicitudes(
      (solRaw ?? []).filter((d: any) => d.user?.id).map((d: any, i: number) => ({
        id:       d.id,
        uid:      d.user.id,
        nombre:   d.user.full_name ?? d.user.username ?? 'Usuario',
        usuario:  d.user.username ? `@${d.user.username}` : '',
        initials: (d.user.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        colorIdx: i,
      }))
    )

    // Solicitudes que ya envié (para saber cuales están "pendientes_sent")
    const { data: sentPending } = await supabase
      .from('friendships').select('friend_id').eq('user_id', me).eq('status', 'pending')
    const yaEnviados = new Set<string>((sentPending ?? []).map((d: any) => d.friend_id))
    setEnviados(yaEnviados)

    // Sugerencias: perfiles que no son amigos ni yo
    const yaConectados = new Set([me, ...amigosList.map(a => a.id), ...(solRaw ?? []).map((d: any) => d.user?.id).filter(Boolean)])
    const { data: todos } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .limit(30)
    const sugs: Sugerencia[] = (todos ?? [])
      .filter((p: any) => p.id && !yaConectados.has(p.id))
      .slice(0, 6)
      .map((p: any, i: number) => ({
        id:       p.id,
        nombre:   p.full_name ?? p.username ?? 'Usuario',
        usuario:  p.username ? `@${p.username}` : '',
        initials: (p.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        colorIdx: i,
      }))
    setSugerencias(sugs)

    // Ranking top XP
    const { data: topXP } = await supabase
      .from('profiles')
      .select('id, full_name, username, xp_points')
      .order('xp_points', { ascending: false })
      .limit(5)
    setRanking((topXP ?? []).map((p: any, i: number) => ({
      id:       p.id,
      nombre:   p.full_name ?? p.username ?? 'Usuario',
      initials: (p.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      xp:       p.xp_points ?? 0,
      colorIdx: i,
    })))

    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function toAmigo(p: any, i: number): Amigo {
    return {
      id:       p.id,
      nombre:   p.full_name ?? p.username ?? 'Usuario',
      usuario:  p.username ? `@${p.username}` : '',
      initials: (p.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      colorIdx: i,
    }
  }

  const agregarAmigo = async (uid: string) => {
    if (!miId) { router.push('/auth'); return }
    setProcesando(uid)
    await supabase.from('friendships').upsert({ user_id: miId, friend_id: uid, status: 'pending' }, { onConflict: 'user_id,friend_id' })
    setEnviados(prev => new Set([...prev, uid]))
    crearNotificacion({ userId: uid, tipo: 'amigo', title: 'Nueva solicitud de amistad', body: 'Alguien quiere ser tu amigo en Trivai', emoji: '👋', data: { href: '/amigos' } })
    setProcesando(null)
  }

  const aceptarSolicitud = async (sol: Solicitud) => {
    if (!miId) return
    setProcesando(sol.uid)
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', sol.id)
    await supabase.from('friendships').upsert({ user_id: miId, friend_id: sol.uid, status: 'accepted' }, { onConflict: 'user_id,friend_id' })
    setSolicitudes(prev => prev.filter(s => s.id !== sol.id))
    setAmigos(prev => [...prev, { id: sol.uid, nombre: sol.nombre, usuario: sol.usuario, initials: sol.initials, colorIdx: prev.length }])
    crearNotificacion({ userId: sol.uid, tipo: 'amigo', title: '¡Aceptaron tu solicitud!', body: 'Ya son amigos en Trivai', emoji: '🤝', data: { href: '/amigos' } })
    grantXP(miId, XP.amigo)
    grantXP(sol.uid, XP.amigo)
    setProcesando(null)
  }

  const rechazarSolicitud = async (sol: Solicitud) => {
    setProcesando(sol.uid)
    await supabase.from('friendships').update({ status: 'rejected' }).eq('id', sol.id)
    setSolicitudes(prev => prev.filter(s => s.id !== sol.id))
    setProcesando(null)
  }

  const pendientes = solicitudes.length

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'todos',       label: 'Todos' },
    { id: 'amigos',      label: 'Amigos' },
    { id: 'solicitudes', label: 'Solicitudes', badge: pendientes },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Amigos</Text>
          <Text style={styles.subtitle}>Conecta y descubre juntos</Text>
        </View>
      </View>

      {/* BUSCADOR */}
      <TouchableOpacity style={styles.searchBox} onPress={() => router.push('/buscar')}>
        <Search size={18} color={T.fg3} />
        <Text style={styles.searchText}>Buscar amigos...</Text>
      </TouchableOpacity>

      {/* TABS */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.id} style={styles.tabBtn} onPress={() => setTab(t.id)}>
            <View style={styles.tabLabelRow}>
              <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
              {t.badge != null && t.badge > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{t.badge}</Text></View>
              )}
            </View>
            <View style={[styles.tabLine, tab === t.id && styles.tabLineActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* TAB: TODOS */}
          {tab === 'todos' && (
            <>
              {/* Mis amigos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Mis amigos ({amigos.length})</Text>
                  {amigos.length > 0 && (
                    <TouchableOpacity onPress={() => setTab('amigos')}>
                      <Text style={styles.sectionAction}>Ver todos</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
                  {amigos.slice(0, 8).map(a => (
                    <TouchableOpacity key={a.id} style={styles.friendChip} onPress={() => router.push(`/perfil/${a.id}`)}>
                      <Avatar nombre={a.nombre} colorIdx={a.colorIdx} size={56} />
                      <Text style={styles.friendChipName} numberOfLines={1}>{a.nombre.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                  {amigos.length === 0 && (
                    <Text style={styles.emptyInline}>Agrega amigos para verlos aquí</Text>
                  )}
                  <View style={styles.friendChip}>
                    <TouchableOpacity style={styles.inviteCircle} onPress={() => router.push('/buscar')}>
                      <Plus size={22} color={T.purple} />
                    </TouchableOpacity>
                    <Text style={styles.friendChipName}>Buscar</Text>
                  </View>
                </ScrollView>
              </View>

              {/* Solicitudes pendientes (si hay) */}
              {pendientes > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Solicitudes pendientes</Text>
                    <TouchableOpacity onPress={() => setTab('solicitudes')}>
                      <Text style={styles.sectionAction}>Ver todas</Text>
                    </TouchableOpacity>
                  </View>
                  {solicitudes.slice(0, 2).map(sol => (
                    <View key={sol.id} style={styles.solicitudCardCompact}>
                      <Avatar nombre={sol.nombre} colorIdx={sol.colorIdx} size={44} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.amigoNombre}>{sol.nombre}</Text>
                        <Text style={styles.amigoUsuario}>{sol.usuario}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: S.sm }}>
                        <TouchableOpacity
                          style={styles.miniAceptar}
                          onPress={() => aceptarSolicitud(sol)}
                          disabled={procesando === sol.uid}
                        >
                          <Text style={styles.miniAceptarText}>{procesando === sol.uid ? '...' : 'Aceptar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.miniRechazar}
                          onPress={() => rechazarSolicitud(sol)}
                          disabled={procesando === sol.uid}
                        >
                          <Text style={styles.miniRechazarText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Sugerencias */}
              {sugerencias.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personas que quizás conozcas</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: S.md, paddingRight: S.lg, marginTop: S.md }}>
                    {sugerencias.map(sug => (
                      <TouchableOpacity
                        key={sug.id}
                        style={styles.sugerenciaCard}
                        onPress={() => router.push(`/perfil/${sug.id}`)}
                      >
                        <Avatar nombre={sug.nombre} colorIdx={sug.colorIdx} size={56} />
                        <Text style={styles.sugerenciaNombre} numberOfLines={1}>{sug.nombre.split(' ')[0]}</Text>
                        {sug.usuario ? <Text style={styles.sugerenciaUser} numberOfLines={1}>{sug.usuario}</Text> : null}
                        <TouchableOpacity
                          style={[styles.sugerenciaBtn, enviados.has(sug.id) && styles.sugerenciaBtnAdded]}
                          onPress={() => agregarAmigo(sug.id)}
                          disabled={enviados.has(sug.id) || procesando === sug.id}
                        >
                          {procesando === sug.id
                            ? <ActivityIndicator size="small" color={T.purple} />
                            : <Text style={[styles.sugerenciaBtnText, enviados.has(sug.id) && styles.sugerenciaBtnTextAdded]}>
                                {enviados.has(sug.id) ? '✓ Enviado' : 'Agregar'}
                              </Text>
                          }
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Ranking */}
              {ranking.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🏅 Top Exploradores</Text>
                  {ranking.map((l, i) => {
                    const medals = ['🥇', '🥈', '🥉']
                    const medal  = medals[i] ?? `${i + 1}.`
                    const isMe   = l.id === miId
                    return (
                      <TouchableOpacity
                        key={l.id}
                        style={[styles.rankRow, isMe && styles.rankRowMe]}
                        onPress={() => router.push(`/perfil/${l.id}`)}
                      >
                        <Text style={styles.rankMedal}>{medal}</Text>
                        <View style={[styles.rankAvatar, { backgroundColor: COLORS[l.colorIdx % 4] }]}>
                          <Text style={[styles.rankIni, { color: TEXTS[l.colorIdx % 4] }]}>{l.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rankNombre} numberOfLines={1}>
                            {l.nombre.split(' ')[0]}{isMe ? ' (tú)' : ''}
                          </Text>
                          <Text style={styles.rankNivel}>{nivelEmoji(l.xp)} {nivelNombre(l.xp)}</Text>
                        </View>
                        <Text style={styles.rankXP}>{l.xp} XP</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}

              {/* Banner */}
              <View style={styles.planBanner}>
                <View style={styles.planIcon}><Users size={20} color={T.greenInk} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planTitle}>¡Explora con amigos!</Text>
                  <Text style={styles.planSub}>Descubre eventos y lugares juntos.</Text>
                </View>
                <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/eventos')}>
                  <Text style={styles.planBtnText}>Ver eventos</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* TAB: AMIGOS */}
          {tab === 'amigos' && (
            <View style={{ padding: S.lg }}>
              {amigos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>👥</Text>
                  <Text style={styles.emptyTitle}>Aún no tienes amigos</Text>
                  <Text style={styles.emptySub}>Busca personas que conoces para conectar</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/buscar')}>
                    <Text style={styles.emptyBtnText}>Buscar amigos</Text>
                  </TouchableOpacity>
                </View>
              ) : amigos.map(a => (
                <TouchableOpacity key={a.id} style={styles.amigoRow} onPress={() => router.push(`/perfil/${a.id}`)}>
                  <Avatar nombre={a.nombre} colorIdx={a.colorIdx} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amigoNombre}>{a.nombre}</Text>
                    <Text style={styles.amigoUsuario}>{a.usuario}</Text>
                  </View>
                  <UserCheck size={20} color={T.green} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB: SOLICITUDES */}
          {tab === 'solicitudes' && (
            <View style={{ padding: S.lg, gap: S.md }}>
              {solicitudes.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>✉️</Text>
                  <Text style={styles.emptyTitle}>Sin solicitudes pendientes</Text>
                  <Text style={styles.emptySub}>Cuando alguien te agregue, aparecerá aquí</Text>
                </View>
              ) : solicitudes.map(sol => (
                <View key={sol.id} style={styles.solicitudCard}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md }}
                    onPress={() => router.push(`/perfil/${sol.uid}`)}
                  >
                    <Avatar nombre={sol.nombre} colorIdx={sol.colorIdx} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.amigoNombre}>{sol.nombre}</Text>
                      <Text style={styles.amigoUsuario}>{sol.usuario}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: S.sm }}>
                    <TouchableOpacity
                      style={[styles.solicitudBtnAceptar, procesando === sol.uid && { opacity: 0.6 }]}
                      onPress={() => aceptarSolicitud(sol)}
                      disabled={procesando === sol.uid}
                    >
                      <Text style={styles.solicitudBtnAceptarText}>{procesando === sol.uid ? '...' : 'Aceptar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.solicitudBtnRechazar}
                      onPress={() => rechazarSolicitud(sol)}
                      disabled={procesando === sol.uid}
                    >
                      <Text style={styles.solicitudBtnRechazarText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:                    { flex: 1, backgroundColor: T.bg },
  center:                  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:                  { backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:                   { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  subtitle:                { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  searchBox:               { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.full, paddingHorizontal: S.lg, height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  searchText:              { fontSize: F.size.md, color: T.fg3 },
  tabBar:                  { flexDirection: 'row', backgroundColor: T.surface, marginTop: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:                  { flex: 1, alignItems: 'center' },
  tabLabelRow:             { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: S.md },
  tabLabel:                { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg3 },
  tabLabelActive:          { color: T.green },
  tabLine:                 { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabLineActive:           { backgroundColor: T.green },
  badge:                   { width: 18, height: 18, borderRadius: 9, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  badgeText:               { fontSize: 10, fontWeight: F.weight.bold, color: '#fff' },
  section:                 { padding: S.lg, paddingBottom: S.md },
  sectionHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:            { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:           { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  emptyInline:             { fontSize: F.size.sm, color: T.fg3, alignSelf: 'center', paddingVertical: S.md },
  friendChip:              { alignItems: 'center', width: 72 },
  friendChipName:          { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1, marginTop: 6, textAlign: 'center' },
  inviteCircle:            { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: T.purple, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sugerenciaCard:          { width: 130, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  sugerenciaNombre:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, marginTop: S.sm, textAlign: 'center' },
  sugerenciaUser:          { fontSize: F.size.xs, color: T.fg3, marginTop: 2, textAlign: 'center' },
  sugerenciaBtn:           { marginTop: S.sm, width: '100%', height: 32, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  sugerenciaBtnAdded:      { backgroundColor: T.greenSoft },
  sugerenciaBtnText:       { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.purple },
  sugerenciaBtnTextAdded:  { color: T.green },
  planBanner:              { flexDirection: 'row', alignItems: 'center', gap: S.md, margin: S.lg, backgroundColor: T.greenSoft, borderRadius: R.lg, padding: S.md },
  planIcon:                { width: 40, height: 40, borderRadius: R.md, backgroundColor: 'rgba(33,162,74,0.15)', alignItems: 'center', justifyContent: 'center' },
  planTitle:               { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  planSub:                 { fontSize: F.size.xs, color: T.fg2, marginTop: 2 },
  planBtn:                 { paddingHorizontal: S.md, paddingVertical: 8, backgroundColor: T.green, borderRadius: R.full },
  planBtnText:             { fontSize: F.size.xs, fontWeight: F.weight.bold, color: '#fff' },
  amigoRow:                { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  amigoNombre:             { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  amigoUsuario:            { fontSize: F.size.sm, color: T.fg3 },
  solicitudCard:           { backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: T.border },
  solicitudCardCompact:    { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, marginBottom: S.sm, borderWidth: 1, borderColor: T.border },
  solicitudBtnAceptar:     { flex: 1, height: 40, borderRadius: R.md, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' },
  solicitudBtnAceptarText: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  solicitudBtnRechazar:    { flex: 1, height: 40, borderRadius: R.md, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  solicitudBtnRechazarText:{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  miniAceptar:             { paddingHorizontal: S.md, height: 34, borderRadius: R.full, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' },
  miniAceptarText:         { fontSize: F.size.xs, fontWeight: F.weight.bold, color: '#fff' },
  miniRechazar:            { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  miniRechazarText:        { fontSize: F.size.sm, color: T.fg3 },
  emptyState:              { alignItems: 'center', paddingVertical: 48, gap: S.md },
  emptyEmoji:              { fontSize: 40 },
  emptyTitle:              { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  emptySub:                { fontSize: F.size.sm, color: T.fg3, textAlign: 'center' },
  emptyBtn:                { paddingHorizontal: S.xl, paddingVertical: S.md, backgroundColor: T.purple, borderRadius: R.full },
  emptyBtnText:            { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  rankRow:                 { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  rankRowMe:               { backgroundColor: T.purpleSoft, borderRadius: R.md, paddingHorizontal: S.sm, borderBottomWidth: 0, marginVertical: 2 },
  rankMedal:               { fontSize: 20, width: 28, textAlign: 'center' },
  rankAvatar:              { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rankIni:                 { fontSize: F.size.sm, fontWeight: F.weight.bold },
  rankNombre:              { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  rankNivel:               { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  rankXP:                  { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
})

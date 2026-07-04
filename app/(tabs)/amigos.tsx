import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import {
  Search, UserPlus, MessageCircle,
  Users, ChevronRight, Plus,
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'
import { TrivaiHeader } from '@/components/TrivaiHeader'
import { CatCover } from '@/components/CatCover'
import { grantXP, XP } from '@/lib/xp'
import { crearNotificacion } from '@/lib/notify'
import { deferredPush } from '@/lib/deferredNav'

const COLORS = [T.purpleSoft, T.orangeSoft, T.greenSoft, T.muted]
const TEXTS  = [T.purple,      T.orange,      T.green,      T.fg2   ]

type Amigo = {
  id: string
  nombre: string
  usuario: string
  initials: string
  avatarUrl: string | null
  colorIdx: number
  status: { label: string; color: string; online?: boolean }
}

type Solicitud = {
  id: string
  uid: string
  nombre: string
  usuario: string
  initials: string
  avatarUrl: string | null
  colorIdx: number
}

type Sugerencia = {
  id: string
  nombre: string
  usuario: string
  initials: string
  avatarUrl: string | null
  colorIdx: number
  mutuos: number
}

type ActividadAmigo = {
  id: string
  quien: string
  ini: string
  avatarUrl: string | null
  colorIdx: number
  accion: string
  detalle: string
  categoria: string
  href: string
  tipo: 'evento' | 'lugar'
}

type GrupoPlan = {
  id: string
  nombre: string
  actividad: string
  miembros: { ini: string; colorIdx: number; avatarUrl: string | null }[]
}

function FriendAvatar({
  nombre, initials, avatarUrl, colorIdx, size = 48, online = false,
}: {
  nombre: string; initials: string; avatarUrl: string | null
  colorIdx: number; size?: number; online?: boolean
}) {
  return (
    <View style={{ position: 'relative' }}>
      {avatarUrl
        ? <Image source={{ uri: avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        : (
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS[colorIdx % 4], alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: size * 0.34, fontWeight: F.weight.bold, color: TEXTS[colorIdx % 4] }}>{initials}</Text>
          </View>
        )}
      {online && <View style={[styles.onlineDot, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, right: 0, bottom: 0 }]} />}
    </View>
  )
}

function toProfile(p: any, i: number) {
  const nombre = p.full_name ?? p.username ?? 'Usuario'
  return {
    initials: nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    avatarUrl: p.avatar_url ?? null,
    colorIdx: i,
  }
}

/** Estado simulado cuando no hay presencia real */
function statusAmigo(id: string, enEvento: boolean): Amigo['status'] {
  if (enEvento) return { label: 'En evento ahora', color: T.orange }
  const h = id.charCodeAt(0) % 4
  if (h === 0) return { label: 'En línea', color: T.green, online: true }
  if (h === 1) return { label: 'Hace 2h', color: T.fg3 }
  if (h === 2) return { label: 'Hace 1d', color: T.fg3 }
  return { label: 'Activo recientemente', color: T.fg3 }
}

export default function Amigos() {
  const { initials, avatarUrl, isAuthenticated } = useUser()
  const [miId,        setMiId]        = useState<string | null>(null)
  const [amigos,      setAmigos]      = useState<Amigo[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [actividad,   setActividad]   = useState<ActividadAmigo[]>([])
  const [grupos,      setGrupos]      = useState<GrupoPlan[]>([])
  const [loading,     setLoading]     = useState(true)
  const [busqueda,    setBusqueda]    = useState('')
  const [enviados,    setEnviados]    = useState<Set<string>>(new Set())
  const [procesando,  setProcesando]  = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const me = session?.user?.id ?? null
    setMiId(me)
    if (!me) { setLoading(false); return }

    const [{ data: sent }, { data: recv }] = await Promise.all([
      supabase.from('friendships').select('friend:profiles!friend_id(id, full_name, username, avatar_url)').eq('user_id', me).eq('status', 'accepted'),
      supabase.from('friendships').select('user:profiles!user_id(id, full_name, username, avatar_url)').eq('friend_id', me).eq('status', 'accepted'),
    ])

    const amigosSent = (sent ?? []).filter((d: any) => d.friend?.id).map((d: any, i: number) => {
      const meta = toProfile(d.friend, i)
      return {
        id: d.friend.id,
        nombre: d.friend.full_name ?? d.friend.username ?? 'Usuario',
        usuario: d.friend.username ? `@${d.friend.username}` : '',
        ...meta,
        status: statusAmigo(d.friend.id, false),
      } as Amigo
    })
    const amigosIds = new Set(amigosSent.map(a => a.id))
    const amigosRecv = (recv ?? []).filter((d: any) => d.user?.id && !amigosIds.has(d.user.id)).map((d: any, i: number) => {
      const meta = toProfile(d.user, amigosSent.length + i)
      return {
        id: d.user.id,
        nombre: d.user.full_name ?? d.user.username ?? 'Usuario',
        usuario: d.user.username ? `@${d.user.username}` : '',
        ...meta,
        status: statusAmigo(d.user.id, false),
      } as Amigo
    })
    const amigosList = [...amigosSent, ...amigosRecv]
    const friendIds = amigosList.map(a => a.id)

    // Solicitudes pendientes
    const { data: solRaw } = await supabase
      .from('friendships')
      .select('id, user:profiles!user_id(id, full_name, username, avatar_url)')
      .eq('friend_id', me)
      .eq('status', 'pending')

    setSolicitudes(
      (solRaw ?? []).filter((d: any) => d.user?.id).map((d: any, i: number) => {
        const meta = toProfile(d.user, i)
        return {
          id: d.id,
          uid: d.user.id,
          nombre: d.user.full_name ?? d.user.username ?? 'Usuario',
          usuario: d.user.username ? `@${d.user.username}` : '',
          ...meta,
        }
      })
    )

    const { data: sentPending } = await supabase
      .from('friendships').select('friend_id').eq('user_id', me).eq('status', 'pending')
    setEnviados(new Set((sentPending ?? []).map((d: any) => d.friend_id)))

    // Actividad + eventos en curso (para status "En evento ahora")
    const enEventoIds = new Set<string>()
    let actItems: ActividadAmigo[] = []
    let gruposItems: GrupoPlan[] = []

    if (friendIds.length > 0) {
      const [{ data: asistencias }, { data: favs }] = await Promise.all([
        supabase.from('event_attendees')
          .select('user_id, created_at, event:events(id,name,category,start_datetime)')
          .in('user_id', friendIds)
          .eq('status', 'going')
          .order('created_at', { ascending: false })
          .limit(12),
        supabase.from('favorites')
          .select('user_id, created_at, place:places(id,name,category)')
          .in('user_id', friendIds)
          .order('created_at', { ascending: false })
          .limit(8),
      ])

      const amigoMap = new Map(amigosList.map(a => [a.id, a]))

      for (const a of asistencias ?? []) {
        const ev = (a as any).event
        if (!ev?.id) continue
        const am = amigoMap.get(a.user_id)
        if (!am) continue
        const evStart = new Date(ev.start_datetime)
        const enCurso = evStart.getTime() - Date.now() < 3 * 3600000 && evStart.getTime() > Date.now() - 3600000
        if (enCurso) enEventoIds.add(a.user_id)
        actItems.push({
          id: `ev-${ev.id}-${a.user_id}`,
          quien: am.nombre.split(' ')[0],
          ini: am.initials,
          avatarUrl: am.avatarUrl,
          colorIdx: am.colorIdx,
          accion: enCurso ? 'Está en un evento' : 'Va a un evento',
          detalle: ev.name,
          categoria: ev.category ?? 'Entretenimiento',
          href: `/eventos/${ev.id}`,
          tipo: 'evento',
        })
      }

      for (const f of favs ?? []) {
        const pl = (f as any).place
        if (!pl?.id) continue
        const am = amigoMap.get(f.user_id)
        if (!am) continue
        actItems.push({
          id: `fav-${pl.id}-${f.user_id}`,
          quien: am.nombre.split(' ')[0],
          ini: am.initials,
          avatarUrl: am.avatarUrl,
          colorIdx: am.colorIdx,
          accion: 'Visitó un lugar',
          detalle: pl.name,
          categoria: pl.category ?? 'Otros',
          href: `/lugares/${pl.id}`,
          tipo: 'lugar',
        })
      }

      // Grupos derivados: eventos con 2+ amigos yendo
      const porEvento = new Map<string, { nombre: string; miembros: GrupoPlan['miembros'] }>()
      for (const a of asistencias ?? []) {
        const ev = (a as any).event
        if (!ev?.id) continue
        const am = amigoMap.get(a.user_id)
        if (!am) continue
        if (!porEvento.has(ev.id)) porEvento.set(ev.id, { nombre: ev.name, miembros: [] })
        porEvento.get(ev.id)!.miembros.push({ ini: am.initials, colorIdx: am.colorIdx, avatarUrl: am.avatarUrl })
      }
      gruposItems = [...porEvento.entries()]
        .filter(([, g]) => g.miembros.length >= 2)
        .slice(0, 4)
        .map(([id, g]) => ({
          id,
          nombre: g.nombre,
          actividad: `${g.miembros.length} amigos van juntos`,
          miembros: g.miembros.slice(0, 5),
        }))
    }

    // Actualizar status con eventos en curso
    const amigosFinal = amigosList.map(a => ({
      ...a,
      status: statusAmigo(a.id, enEventoIds.has(a.id)),
    }))
    setAmigos(amigosFinal)
    setActividad(actItems.slice(0, 8))
    setGrupos(gruposItems)

    // Sugerencias con amigos en común
    const yaConectados = new Set([me, ...amigosList.map(a => a.id), ...(solRaw ?? []).map((d: any) => d.user?.id).filter(Boolean)])
    const { data: todosPerfiles } = await supabase.from('profiles').select('id, full_name, username, avatar_url').limit(40)
    const candidatos = (todosPerfiles ?? []).filter((p: any) => p.id && !yaConectados.has(p.id)).slice(0, 8)

    let grafoAmigos = new Map<string, Set<string>>()
    if (candidatos.length > 0) {
      const { data: todasAmistades } = await supabase.from('friendships').select('user_id, friend_id').eq('status', 'accepted')
      for (const f of todasAmistades ?? []) {
        if (!grafoAmigos.has(f.user_id)) grafoAmigos.set(f.user_id, new Set())
        if (!grafoAmigos.has(f.friend_id)) grafoAmigos.set(f.friend_id, new Set())
        grafoAmigos.get(f.user_id)!.add(f.friend_id)
        grafoAmigos.get(f.friend_id)!.add(f.user_id)
      }
    }
    const misAmigosSet = new Set(friendIds)
    setSugerencias(candidatos.map((p: any, i: number) => {
      const meta = toProfile(p, i)
      const susAmigos = grafoAmigos.get(p.id) ?? new Set()
      let mutuos = 0
      for (const fid of misAmigosSet) if (susAmigos.has(fid)) mutuos++
      return {
        id: p.id,
        nombre: p.full_name ?? p.username ?? 'Usuario',
        usuario: p.username ? `@${p.username}` : '',
        mutuos,
        ...meta,
      }
    }))

    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const amigosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return amigos
    return amigos.filter(a =>
      a.nombre.toLowerCase().includes(q) || a.usuario.toLowerCase().includes(q)
    )
  }, [amigos, busqueda])

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
    crearNotificacion({ userId: sol.uid, tipo: 'amigo', title: '¡Aceptaron tu solicitud!', body: 'Ya son amigos en Trivai', emoji: '🤝', data: { href: '/amigos' } })
    grantXP(miId, XP.amigo)
    grantXP(sol.uid, XP.amigo)
    setProcesando(null)
    cargar()
  }

  const rechazarSolicitud = async (sol: Solicitud) => {
    setProcesando(sol.uid)
    await supabase.from('friendships').update({ status: 'rejected' }).eq('id', sol.id)
    setSolicitudes(prev => prev.filter(s => s.id !== sol.id))
    setProcesando(null)
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* 1. HEADER */}
        <TrivaiHeader
          title="Amigos"
          left={
            <TouchableOpacity style={styles.roundBtn} onPress={() => router.push('/perfil')}>
              {avatarUrl
                ? <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
                : <Text style={styles.headerIni}>{initials}</Text>}
            </TouchableOpacity>
          }
          right={
            <TouchableOpacity style={styles.roundBtnSurface} onPress={() => router.push('/buscar')}>
              <UserPlus size={20} color={T.purple} strokeWidth={2} />
            </TouchableOpacity>
          }
        />

        {/* 2. BUSCADOR */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={17} color={T.fg3} />
            <TextInput
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar amigos..."
              placeholderTextColor={T.fg3}
              returnKeyType="search"
            />
          </View>
        </View>

        <LinearGradient
          colors={[T.orange, T.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Crea planes con tus amigos</Text>
            <Text style={styles.ctaSub}>Organiza salidas y comparte la experiencia.</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => deferredPush(isAuthenticated ? '/publicar' : '/auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Crear plan</Text>
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator color={T.purple} style={{ marginTop: 40 }} />
        ) : !isAuthenticated ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>Conecta con amigos</Text>
            <Text style={styles.emptySub}>Inicia sesión para ver tu red social en Trivai</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/auth')}>
              <Text style={styles.emptyBtnText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 3. SOLICITUDES */}
            {solicitudes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Solicitudes</Text>
                <View style={styles.card}>
                  {solicitudes.map((sol, idx) => (
                    <View key={sol.id} style={[styles.solicitudRow, idx < solicitudes.length - 1 && styles.rowBorder]}>
                      <TouchableOpacity style={styles.solicitudInfo} onPress={() => router.push(`/perfil/${sol.uid}`)}>
                        <FriendAvatar nombre={sol.nombre} initials={sol.initials} avatarUrl={sol.avatarUrl} colorIdx={sol.colorIdx} size={44} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.friendName} numberOfLines={1}>{sol.nombre}</Text>
                          <Text style={styles.friendUser} numberOfLines={1}>{sol.usuario}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.solicitudActions}>
                        <TouchableOpacity
                          style={styles.btnAceptar}
                          onPress={() => aceptarSolicitud(sol)}
                          disabled={procesando === sol.uid}
                        >
                          <Text style={styles.btnAceptarText}>{procesando === sol.uid ? '...' : 'Aceptar'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnRechazar}
                          onPress={() => rechazarSolicitud(sol)}
                          disabled={procesando === sol.uid}
                        >
                          <Text style={styles.btnRechazarText}>Rechazar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 4. LISTA DE AMIGOS */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tus amigos ({amigos.length})</Text>
                {amigos.length > 0 && (
                  <TouchableOpacity onPress={() => router.push('/buscar')}>
                    <Text style={styles.sectionAction}>Agregar</Text>
                  </TouchableOpacity>
                )}
              </View>
              {amigos.length === 0 ? (
                <View style={styles.emptyInline}>
                  <Text style={styles.emptyInlineText}>Aún no tienes amigos. ¡Busca personas que conozcas!</Text>
                  <TouchableOpacity style={styles.emptyBtnSmall} onPress={() => router.push('/buscar')}>
                    <Text style={styles.emptyBtnText}>Buscar amigos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.card}>
                  {amigosFiltrados.map((a, idx) => (
                    <View
                      key={a.id}
                      style={[styles.friendRow, idx < amigosFiltrados.length - 1 && styles.rowBorder]}
                    >
                      <TouchableOpacity
                        style={styles.friendMain}
                        onPress={() => deferredPush(`/perfil/${a.id}`)}
                        activeOpacity={0.7}
                      >
                        <FriendAvatar
                          nombre={a.nombre} initials={a.initials} avatarUrl={a.avatarUrl}
                          colorIdx={a.colorIdx} size={48} online={a.status.online}
                        />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.friendName} numberOfLines={1}>{a.nombre}</Text>
                          <Text style={[styles.friendStatus, { color: a.status.color }]}>{a.status.label}</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.friendActions}>
                        <TouchableOpacity style={styles.iconAction} onPress={() => deferredPush(`/perfil/${a.id}`)} hitSlop={8}>
                          <MessageCircle size={18} color={T.purple} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.inviteBtn} onPress={() => deferredPush('/eventos')} hitSlop={8}>
                          <Text style={styles.inviteBtnText}>Invitar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  {amigosFiltrados.length === 0 && busqueda.trim() && (
                    <Text style={styles.noResults}>Sin resultados para "{busqueda.trim()}"</Text>
                  )}
                </View>
              )}
            </View>

            {/* 5. ACTIVIDAD DE AMIGOS */}
            {actividad.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actividad de amigos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
                  {actividad.map(act => (
                    <TouchableOpacity
                      key={act.id}
                      style={styles.activityCard}
                      onPress={() => router.push(act.href as any)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.activityHeader}>
                        <FriendAvatar nombre={act.quien} initials={act.ini} avatarUrl={act.avatarUrl} colorIdx={act.colorIdx} size={36} />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.activityQuien} numberOfLines={1}>{act.quien}</Text>
                          <Text style={styles.activityAccion}>{act.accion}</Text>
                        </View>
                      </View>
                      <View style={styles.activityPreview}>
                        <CatCover category={act.categoria} variant="banner" style={{ height: 72 }} />
                        <Text style={styles.activityDetalle} numberOfLines={2}>{act.detalle}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 6. SUGERENCIAS */}
            {sugerencias.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personas que podrías conocer</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
                  {sugerencias.map(sug => (
                    <View key={sug.id} style={styles.suggestionCard}>
                      <TouchableOpacity onPress={() => router.push(`/perfil/${sug.id}`)} activeOpacity={0.8}>
                        <FriendAvatar nombre={sug.nombre} initials={sug.initials} avatarUrl={sug.avatarUrl} colorIdx={sug.colorIdx} size={56} />
                        <Text style={styles.sugNombre} numberOfLines={1}>{sug.nombre.split(' ')[0]}</Text>
                        {sug.usuario ? <Text style={styles.sugUser} numberOfLines={1}>{sug.usuario}</Text> : null}
                        {sug.mutuos > 0 && (
                          <Text style={styles.sugMutuos}>{sug.mutuos} amigo{sug.mutuos !== 1 ? 's' : ''} en común</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.sugBtn, enviados.has(sug.id) && styles.sugBtnSent]}
                        onPress={() => agregarAmigo(sug.id)}
                        disabled={enviados.has(sug.id) || procesando === sug.id}
                      >
                        {procesando === sug.id
                          ? <ActivityIndicator size="small" color={T.purple} />
                          : <Text style={[styles.sugBtnText, enviados.has(sug.id) && styles.sugBtnTextSent]}>
                              {enviados.has(sug.id) ? 'Enviado' : 'Agregar'}
                            </Text>}
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 7. GRUPOS (derivados de eventos compartidos) */}
            {grupos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Grupos</Text>
                {grupos.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={styles.groupCard}
                    onPress={() => router.push(`/eventos/${g.id}`)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.groupNombre} numberOfLines={1}>{g.nombre}</Text>
                      <Text style={styles.groupActividad}>{g.actividad}</Text>
                      <View style={styles.groupAvatars}>
                        {g.miembros.map((m, i) => (
                          <View key={i} style={[styles.groupAvatar, { backgroundColor: COLORS[m.colorIdx % 4], marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }]}>
                            {m.avatarUrl
                              ? <Image source={{ uri: m.avatarUrl }} style={styles.groupAvatarImg} />
                              : <Text style={styles.groupIni}>{m.ini}</Text>}
                          </View>
                        ))}
                      </View>
                    </View>
                    <ChevronRight size={18} color={T.fg4} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Grupo vacío: invitar a crear */}
            {grupos.length === 0 && amigos.length >= 2 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Grupos</Text>
                <TouchableOpacity style={styles.groupPlaceholder} onPress={() => router.push('/publicar')} activeOpacity={0.85}>
                  <View style={styles.groupPlaceholderIcon}>
                    <Users size={22} color={T.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupNombre}>Crea tu primer grupo</Text>
                    <Text style={styles.groupActividad}>Invita amigos a un plan compartido</Text>
                  </View>
                  <Plus size={20} color={T.purple} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: '#FFFFFF' },
  roundBtn:          { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  roundBtnSurface:   { width: 38, height: 38, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  headerAvatar:      { width: 38, height: 38, borderRadius: 19 },
  headerIni:         { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  searchRow:         { paddingHorizontal: S.lg, marginTop: S.lg },
  searchBox:         { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.bg, borderRadius: R.xl, paddingHorizontal: S.lg, height: 48 },
  searchInput:       { flex: 1, fontSize: F.size.sm, color: T.fg1, paddingVertical: 0 },
  section:           { paddingHorizontal: S.lg, marginTop: S.xxl },
  sectionHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:      { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1, letterSpacing: -0.3, marginBottom: S.md },
  sectionAction:     { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold, marginBottom: S.md },
  card:              { backgroundColor: T.surface, borderRadius: R.xl, shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  rowBorder:         { borderBottomWidth: 1, borderBottomColor: T.border },
  onlineDot:         { position: 'absolute', backgroundColor: T.green, borderWidth: 2, borderColor: '#fff' },
  // Solicitudes
  solicitudRow:      { padding: S.lg, gap: S.md },
  solicitudInfo:     { flexDirection: 'row', alignItems: 'center', gap: S.md },
  solicitudActions:  { flexDirection: 'row', gap: S.sm },
  btnAceptar:        { flex: 1, height: 38, borderRadius: R.full, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' },
  btnAceptarText:    { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  btnRechazar:       { flex: 1, height: 38, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  btnRechazarText:   { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  // Amigos
  friendRow:         { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  friendMain:        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.md, minWidth: 0 },
  friendName:        { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  friendUser:        { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  friendStatus:      { fontSize: F.size.xs, fontWeight: F.weight.medium, marginTop: 2 },
  friendActions:     { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  iconAction:        { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  inviteBtn:         { paddingHorizontal: S.md, paddingVertical: 7, borderRadius: R.full, backgroundColor: T.orangeSoft },
  inviteBtnText:     { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.orange },
  noResults:         { padding: S.lg, textAlign: 'center', fontSize: F.size.sm, color: T.fg3 },
  // Actividad
  activityCard:      { width: 220, backgroundColor: T.surface, borderRadius: R.xl, padding: S.md, shadowColor: '#15131A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  activityHeader:    { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.sm },
  activityQuien:     { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  activityAccion:    { fontSize: F.size.xs, color: T.fg3 },
  activityPreview:   { borderRadius: R.lg, overflow: 'hidden', backgroundColor: T.muted },
  activityDetalle:   { fontSize: F.size.xs, fontWeight: F.weight.semibold, color: T.fg1, padding: S.sm },
  // Sugerencias
  suggestionCard:    { width: 140, backgroundColor: T.surface, borderRadius: R.xl, padding: S.md, alignItems: 'center', shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sugNombre:         { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, marginTop: S.sm, textAlign: 'center' },
  sugUser:           { fontSize: F.size.xs, color: T.fg3, marginTop: 2, textAlign: 'center' },
  sugMutuos:         { fontSize: 10, color: T.purple, fontWeight: F.weight.semibold, marginTop: 4, textAlign: 'center' },
  sugBtn:            { marginTop: S.sm, width: '100%', height: 34, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  sugBtnSent:        { backgroundColor: T.greenSoft },
  sugBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  sugBtnTextSent:    { color: T.green },
  // CTA
  ctaCard:           { flexDirection: 'row', alignItems: 'center', gap: S.md, marginHorizontal: S.lg, marginTop: S.lg, borderRadius: R.xl, padding: S.xl, shadowColor: T.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  ctaTitle:          { fontSize: F.size.xl, fontWeight: F.weight.bold, color: '#fff' },
  ctaSub:            { fontSize: F.size.sm, color: 'rgba(255,255,255,0.9)', marginTop: 3 },
  ctaBtn:            { backgroundColor: '#fff', paddingHorizontal: S.xl, paddingVertical: 11, borderRadius: R.full, flexShrink: 0 },
  ctaBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.orange },
  // Grupos
  groupCard:         { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.xl, padding: S.lg, marginBottom: S.sm, shadowColor: '#15131A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  groupNombre:       { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  groupActividad:    { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  groupAvatars:      { flexDirection: 'row', alignItems: 'center', marginTop: S.sm },
  groupAvatar:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  groupAvatarImg:    { width: 28, height: 28, borderRadius: 14 },
  groupIni:          { fontSize: 10, fontWeight: F.weight.bold, color: T.fg1 },
  groupPlaceholder:  { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.purpleSoft, borderRadius: R.xl, padding: S.lg },
  groupPlaceholderIcon: { width: 44, height: 44, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  // Empty
  emptyState:        { alignItems: 'center', paddingVertical: 48, paddingHorizontal: S.lg, gap: S.md },
  emptyInline:       { alignItems: 'center', padding: S.xl, gap: S.md },
  emptyInlineText:   { fontSize: F.size.sm, color: T.fg3, textAlign: 'center' },
  emptyEmoji:        { fontSize: 40 },
  emptyTitle:        { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  emptySub:          { fontSize: F.size.sm, color: T.fg3, textAlign: 'center' },
  emptyBtn:          { paddingHorizontal: S.xl, paddingVertical: S.md, backgroundColor: T.purple, borderRadius: R.full, marginTop: S.sm },
  emptyBtnSmall:     { paddingHorizontal: S.lg, paddingVertical: S.sm, backgroundColor: T.purple, borderRadius: R.full },
  emptyBtnText:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
})

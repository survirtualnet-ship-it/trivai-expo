import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Star, UserCheck, UserPlus, Clock } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'
import { grantXP, XP } from '@/lib/xp'
import { crearNotificacion } from '@/lib/notify'

type Profile = {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  city: string | null
  avatar_url: string | null
}

type FriendState = 'none' | 'pending_sent' | 'pending_received' | 'accepted'

type Review = {
  id: string
  rating: number
  text: string | null
  created_at: string
  place: { id: string; name: string } | null
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} color={i <= rating ? T.orange : T.border}
          fill={i <= rating ? T.orange : 'transparent'} strokeWidth={1.5} />
      ))}
    </View>
  )
}

export default function PerfilPublico() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const [perfil,     setPerfil]     = useState<Profile | null>(null)
  const [resenas,    setResenas]    = useState<Review[]>([])
  const [estadoAmigo, setEstadoAmigo] = useState<FriendState>('none')
  const [miId,       setMiId]       = useState<string | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [toggling,   setToggling]   = useState(false)
  const [esPropio,   setEsPropio]   = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const me = session?.user?.id ?? null
      setMiId(me)

      if (me === id) { setEsPropio(true) }

      const [{ data: p }, { data: revs }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, bio, city, avatar_url').eq('id', id).single(),
        supabase.from('reviews').select('id, rating, text, created_at, place:places(id, name)')
          .eq('user_id', id).order('created_at', { ascending: false }).limit(5),
      ])

      if (p) setPerfil(p)
      if (revs) setResenas(revs as Review[])

      if (me && me !== id) {
        // Buscar relación en ambas direcciones
        const [{ data: sent }, { data: recv }] = await Promise.all([
          supabase.from('friendships').select('status').eq('user_id', me).eq('friend_id', id).maybeSingle(),
          supabase.from('friendships').select('status').eq('user_id', id).eq('friend_id', me).maybeSingle(),
        ])
        if (sent) {
          setEstadoAmigo(sent.status === 'accepted' ? 'accepted' : 'pending_sent')
        } else if (recv) {
          setEstadoAmigo(recv.status === 'accepted' ? 'accepted' : 'pending_received')
        } else {
          setEstadoAmigo('none')
        }
      }

      setLoading(false)
    }
    load()
  }, [id])

  const enviarSolicitud = async () => {
    if (!miId) { router.push('/auth'); return }
    setToggling(true)
    await supabase.from('friendships').upsert({
      user_id:   miId,
      friend_id: id,
      status:    'pending',
    }, { onConflict: 'user_id,friend_id' })
    setEstadoAmigo('pending_sent')
    crearNotificacion({ userId: id, tipo: 'amigo', title: 'Nueva solicitud de amistad', body: 'Alguien quiere ser tu amigo en Trivai', emoji: '👋' })
    setToggling(false)
  }

  const cancelarSolicitud = async () => {
    if (!miId) return
    setToggling(true)
    await supabase.from('friendships').delete().eq('user_id', miId).eq('friend_id', id)
    setEstadoAmigo('none')
    setToggling(false)
  }

  const aceptarSolicitud = async () => {
    if (!miId) return
    setToggling(true)
    await supabase.from('friendships').update({ status: 'accepted' })
      .eq('user_id', id).eq('friend_id', miId)
    await supabase.from('friendships').upsert({
      user_id: miId, friend_id: id, status: 'accepted',
    }, { onConflict: 'user_id,friend_id' })
    setEstadoAmigo('accepted')
    crearNotificacion({ userId: id, tipo: 'amigo', title: '¡Aceptaron tu solicitud!', body: 'Ya son amigos en Trivai', emoji: '🤝' })
    grantXP(miId, XP.amigo)
    grantXP(id, XP.amigo)
    setToggling(false)
  }

  if (loading) return (
    <View style={s.center}><ActivityIndicator color={T.purple} size="large" /></View>
  )

  if (!perfil) return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={T.fg1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Perfil</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={s.center}><Text style={{ color: T.fg3 }}>Usuario no encontrado</Text></View>
    </SafeAreaView>
  )

  const nombre  = perfil.full_name ?? perfil.username ?? 'Usuario'
  const usuario = perfil.username ? `@${perfil.username}` : null
  const ini     = nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const friendBtn = () => {
    if (esPropio) return null
    if (estadoAmigo === 'accepted') return (
      <View style={[s.friendBtn, s.friendBtnAccepted]}>
        <UserCheck size={16} color={T.green} />
        <Text style={[s.friendBtnText, { color: T.green }]}>Amigos</Text>
      </View>
    )
    if (estadoAmigo === 'pending_sent') return (
      <TouchableOpacity style={[s.friendBtn, s.friendBtnPending]} onPress={cancelarSolicitud} disabled={toggling}>
        <Clock size={16} color={T.fg3} />
        <Text style={[s.friendBtnText, { color: T.fg3 }]}>Solicitud enviada</Text>
      </TouchableOpacity>
    )
    if (estadoAmigo === 'pending_received') return (
      <TouchableOpacity style={[s.friendBtn, s.friendBtnAdd]} onPress={aceptarSolicitud} disabled={toggling}>
        <UserPlus size={16} color="#fff" />
        <Text style={[s.friendBtnText, { color: '#fff' }]}>
          {toggling ? '...' : 'Aceptar solicitud'}
        </Text>
      </TouchableOpacity>
    )
    return (
      <TouchableOpacity style={[s.friendBtn, s.friendBtnAdd]} onPress={enviarSolicitud} disabled={toggling}>
        <UserPlus size={16} color="#fff" />
        <Text style={[s.friendBtnText, { color: '#fff' }]}>
          {toggling ? '...' : 'Agregar amigo'}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={20} color={T.fg1} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{nombre}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* HERO */}
        <View style={s.hero}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{ini}</Text>
          </View>
          <Text style={s.nombre}>{nombre}</Text>
          {usuario && <Text style={s.username}>{usuario}</Text>}
          {perfil.city && <Text style={s.ciudad}>📍 {perfil.city}</Text>}
          {perfil.bio  && <Text style={s.bio}>{perfil.bio}</Text>}

          {esPropio ? (
            <TouchableOpacity style={[s.friendBtn, s.friendBtnPending]} onPress={() => router.push('/perfil/editar')}>
              <Text style={[s.friendBtnText, { color: T.purple }]}>Editar perfil</Text>
            </TouchableOpacity>
          ) : friendBtn()}
        </View>

        {/* RESEÑAS */}
        {resenas.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Reseñas recientes</Text>
            {resenas.map(r => {
              const fecha = new Date(r.created_at).toLocaleDateString('es-BO', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <TouchableOpacity
                  key={r.id}
                  style={s.resenaCard}
                  onPress={() => r.place && router.push(`/lugares/${r.place.id}`)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.resenaNombre}>{r.place?.name ?? 'Lugar'}</Text>
                    <Stars rating={r.rating} />
                    {r.text ? <Text style={s.resenaTexto} numberOfLines={2}>{r.text}</Text> : null}
                  </View>
                  <Text style={s.resenaFecha}>{fecha}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {resenas.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyText}>Este usuario aún no tiene reseñas</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:            { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:       { flex: 1, fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  hero:              { backgroundColor: T.surface, padding: S.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: T.border, gap: S.sm },
  avatar:            { width: 88, height: 88, borderRadius: 44, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  avatarText:        { fontSize: 32, fontWeight: F.weight.bold, color: T.purple },
  nombre:            { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1 },
  username:          { fontSize: F.size.md, color: T.fg3 },
  ciudad:            { fontSize: F.size.sm, color: T.fg3 },
  bio:               { fontSize: F.size.base, color: T.fg2, textAlign: 'center', lineHeight: 20, marginTop: S.xs },
  friendBtn:         { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.xl, paddingVertical: S.md, borderRadius: R.full, marginTop: S.md },
  friendBtnAdd:      { backgroundColor: T.purple },
  friendBtnAccepted: { backgroundColor: T.greenSoft, borderWidth: 1, borderColor: T.green },
  friendBtnPending:  { backgroundColor: T.muted, borderWidth: 1, borderColor: T.border },
  friendBtnText:     { fontSize: F.size.base, fontWeight: F.weight.bold },
  section:           { padding: S.lg },
  sectionTitle:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.md },
  resenaCard:        { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.sm },
  resenaNombre:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, marginBottom: 4 },
  resenaTexto:       { fontSize: F.size.xs, color: T.fg2, marginTop: 4, lineHeight: 16 },
  resenaFecha:       { fontSize: 10, color: T.fg4, flexShrink: 0 },
  empty:             { padding: S.xl, alignItems: 'center' },
  emptyText:         { fontSize: F.size.sm, color: T.fg3 },
})

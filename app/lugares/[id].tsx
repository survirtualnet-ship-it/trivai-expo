import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, TextInput, Share, Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { MapPin, Phone, Globe, Clock, Star, Navigation, Heart, MessageSquare, Share2 } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { supabase } from '@/lib/supabase'
import type { Place } from '@/lib/supabase'
import { T, F, S, R, getCatColor } from '@/lib/tokens'
import { CatCover, CategoryPill } from '@/components/CatCover'
import { grantXP, XP } from '@/lib/xp'
import { calcIsOpen } from '@/lib/hours'
import { appLink } from '@/lib/appUrl'

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

type Review = {
  id: string
  rating: number
  text: string | null
  created_at: string
  profile: { full_name: string | null; username: string | null } | null
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} color={i <= rating ? T.orange : T.border}
          fill={i <= rating ? T.orange : 'transparent'} strokeWidth={1.5} />
      ))}
    </View>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Star size={32} color={i <= value ? T.orange : T.border}
            fill={i <= value ? T.orange : 'transparent'} strokeWidth={1.5} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function LugarDetalle() {
  const { id }      = useLocalSearchParams<{ id: string }>()
  const [lugar,     setLugar]     = useState<Place | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [favorito,  setFavorito]  = useState(false)
  const [togFav,    setTogFav]    = useState(false)

  // Reseñas
  const [reviews,       setReviews]       = useState<Review[]>([])
  const [miResena,      setMiResena]      = useState<Review | null>(null)
  const [showForm,      setShowForm]      = useState(false)
  const [formRating,    setFormRating]    = useState(0)
  const [formTexto,     setFormTexto]     = useState('')
  const [guardandoRev,  setGuardandoRev]  = useState(false)
  const [userId,        setUserId]        = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: placeData }, { data: { session } }] = await Promise.all([
        supabase.from('places').select('*').eq('id', id).single(),
        supabase.auth.getSession(),
      ])
      if (placeData) setLugar(placeData)

      const uid = session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        const { data: fav } = await supabase.from('favorites')
          .select('id').eq('user_id', uid).eq('place_id', id).maybeSingle()
        setFavorito(!!fav)
      }

      await cargarResenas(uid)
      setLoading(false)
    }
    load()
  }, [id])

  const cargarResenas = async (uid: string | null) => {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, text, created_at, profile:profiles(full_name, username)')
      .eq('place_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      const lista = data as Review[]
      setReviews(lista)
      if (uid) {
        const { data: own } = await supabase
          .from('reviews')
          .select('id, rating, text, created_at, profile:profiles(full_name, username)')
          .eq('place_id', id)
          .eq('user_id', uid)
          .maybeSingle()
        if (own) {
          setMiResena(own as Review)
          setFormRating((own as any).rating)
          setFormTexto((own as any).text ?? '')
        } else {
          setMiResena(null)
        }
      }
    }
  }

  const toggleFavorito = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/auth'); return }
    setTogFav(true)
    if (favorito) {
      await supabase.from('favorites').delete().eq('user_id', session.user.id).eq('place_id', id)
      setFavorito(false)
    } else {
      await supabase.from('favorites').upsert({ user_id: session.user.id, place_id: id })
      setFavorito(true)
      grantXP(session.user.id, XP.favorito)
    }
    setTogFav(false)
  }

  const guardarResena = async () => {
    if (formRating === 0) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { router.push('/auth'); return }

    setGuardandoRev(true)
    await supabase.from('reviews').upsert({
      user_id:  session.user.id,
      place_id: id,
      rating:   formRating,
      text:     formTexto.trim() || null,
    }, { onConflict: 'user_id,place_id' })

    // Recalcular rating_avg y rating_count
    const { data: allRevs } = await supabase
      .from('reviews').select('rating').eq('place_id', id)
    if (allRevs && allRevs.length > 0) {
      const avg = allRevs.reduce((s: number, r: any) => s + r.rating, 0) / allRevs.length
      await supabase.from('places').update({
        rating_avg:   Math.round(avg * 10) / 10,
        rating_count: allRevs.length,
      }).eq('id', id)
      setLugar(prev => prev ? { ...prev, rating_avg: Math.round(avg * 10) / 10, rating_count: allRevs.length } : prev)
    }

    if (!miResena) grantXP(session.user.id, XP.review)
    await cargarResenas(session.user.id)
    setShowForm(false)
    setGuardandoRev(false)
  }

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={T.purple} /></View>
  )
  if (!lugar) return (
    <View style={styles.center}>
      <Text style={styles.notFound}>Lugar no encontrado</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>← Volver</Text>
      </TouchableOpacity>
    </View>
  )

  const color = getCatColor(lugar.category)
  const diaHoy = DIAS[new Date().getDay()]
  const horario = lugar.hours?.[diaHoy] ?? null

  const compartir = () => {
    const url = appLink(`/lugares/${lugar.id}`)
    Share.share({
      title: lugar.name,
      message: `${lugar.name} en Santa Cruz. Ver en Trivai: ${url}`,
      url,
    })
  }

  const abrirMaps = () => {
    if (lugar.latitude && lugar.longitude)
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lugar.latitude},${lugar.longitude}`)
  }

  const resenasPublicas = reviews.filter(r => !miResena || r.id !== miResena.id)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* HEADER */}
      <ScreenHeader
        title={lugar.name}
        fallbackHref="/lugares"
        right={
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <TouchableOpacity style={styles.backBtn} onPress={compartir}>
              <Share2 size={20} color={T.fg2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={toggleFavorito} disabled={togFav}>
              <Heart size={22} color={favorito ? T.danger : T.fg3} fill={favorito ? T.danger : 'none'} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HERO — carrusel de fotos o fallback emoji */}
        {lugar.photos && lugar.photos.length > 0 ? (
          <View style={{ height: 220, position: 'relative' }}>
            <FlatList
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              data={lugar.photos.slice(0, 5)}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.heroPhoto}
                  resizeMode="cover" />
              )}
            />
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>{lugar.photos.length} fotos</Text>
            </View>
            <View style={{ position: 'absolute', top: 12, left: 16 }}>
              <CategoryPill category={lugar.category} />
            </View>
          </View>
        ) : (
          <View style={{ position: 'relative' }}>
            <CatCover category={lugar.category} variant="hero" />
            <View style={{ position: 'absolute', left: S.lg, bottom: S.lg }}>
              <CategoryPill category={lugar.category} />
            </View>
          </View>
        )}

        {/* INFO PRINCIPAL */}
        <View style={styles.mainInfo}>
          <Text style={styles.nombre}>{lugar.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={16} color={T.orange} fill={T.orange} />
            <Text style={styles.rating}>{lugar.rating_avg?.toFixed(1) ?? '—'}</Text>
            <Text style={styles.reviewsCount}>({lugar.rating_count ?? 0} reseñas)</Text>
            <View style={[styles.statusBadge, { backgroundColor: calcIsOpen(lugar.hours, lugar.is_open) ? T.greenSoft : T.muted }]}>
              <Text style={[styles.statusText, { color: calcIsOpen(lugar.hours, lugar.is_open) ? T.green : T.fg3 }]}>
                {calcIsOpen(lugar.hours, lugar.is_open) ? '● Abierto' : '● Cerrado'}
              </Text>
            </View>
          </View>
          {lugar.description && <Text style={styles.description}>{lugar.description}</Text>}
        </View>

        {/* INFORMACIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          {lugar.address && (
            <TouchableOpacity style={styles.infoRow} onPress={abrirMaps}>
              <View style={[styles.infoIcon, { backgroundColor: T.purpleSoft }]}><MapPin size={16} color={T.purple} /></View>
              <Text style={styles.infoText} numberOfLines={2}>{lugar.address}</Text>
            </TouchableOpacity>
          )}
          {lugar.phone && (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${lugar.phone}`)}>
              <View style={[styles.infoIcon, { backgroundColor: T.greenSoft }]}><Phone size={16} color={T.green} /></View>
              <Text style={styles.infoText}>{lugar.phone}</Text>
            </TouchableOpacity>
          )}
          {lugar.website && (
            <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(lugar.website!)}>
              <View style={[styles.infoIcon, { backgroundColor: T.orangeSoft }]}><Globe size={16} color={T.orange} /></View>
              <Text style={[styles.infoText, { color: T.purple }]} numberOfLines={1}>
                {lugar.website.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>
          )}
          {horario && (
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: T.muted }]}><Clock size={16} color={T.fg2} /></View>
              <Text style={styles.infoText}>Hoy: {horario}</Text>
            </View>
          )}
        </View>

        {/* HORARIOS */}
        {lugar.hours && Object.keys(lugar.hours).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horarios</Text>
            {DIAS.map(dia => {
              const h = lugar.hours?.[dia]
              if (!h) return null
              return (
                <View key={dia} style={styles.horarioRow}>
                  <Text style={[styles.horarioDia, dia === diaHoy && { color: T.purple, fontWeight: F.weight.bold }]}>
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </Text>
                  <Text style={[styles.horarioHora, dia === diaHoy && { color: T.purple }]}>{h}</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ═══ RESEÑAS ═══ */}
        <View style={styles.section}>
          <View style={styles.resenaHeader}>
            <View>
              <Text style={styles.sectionTitle}>Reseñas</Text>
              {reviews.length > 0 && (
                <Text style={styles.resenaSubtitle}>{reviews.length} opinión{reviews.length !== 1 ? 'es' : ''}</Text>
              )}
            </View>
            {userId && !showForm && (
              <TouchableOpacity style={styles.escribirBtn} onPress={() => setShowForm(true)}>
                <MessageSquare size={14} color={T.purple} />
                <Text style={styles.escribirBtnText}>{miResena ? 'Editar' : 'Escribir'}</Text>
              </TouchableOpacity>
            )}
            {!userId && (
              <TouchableOpacity style={styles.escribirBtn} onPress={() => router.push('/auth')}>
                <MessageSquare size={14} color={T.purple} />
                <Text style={styles.escribirBtnText}>Reseñar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* MI RESEÑA EXISTENTE */}
          {miResena && !showForm && (
            <View style={styles.miResenaCard}>
              <View style={styles.miResenaTop}>
                <View style={styles.miResenaBadge}><Text style={styles.miResenaBadgeText}>Mi reseña</Text></View>
                <Stars rating={miResena.rating} />
              </View>
              {miResena.text ? <Text style={styles.resenaTexto}>{miResena.text}</Text> : null}
            </View>
          )}

          {/* FORMULARIO */}
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{miResena ? 'Editar mi reseña' : 'Escribe tu reseña'}</Text>
              <View style={styles.formStars}>
                <StarPicker value={formRating} onChange={setFormRating} />
                {formRating > 0 && (
                  <Text style={styles.formRatingLabel}>
                    {['', 'Pésimo', 'Regular', 'Bien', 'Muy bien', '¡Excelente!'][formRating]}
                  </Text>
                )}
              </View>
              <TextInput
                value={formTexto}
                onChangeText={setFormTexto}
                placeholder="Cuéntanos tu experiencia (opcional)..."
                placeholderTextColor={T.fg4}
                multiline
                numberOfLines={4}
                style={styles.formInput}
              />
              <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.md }}>
                <TouchableOpacity style={styles.formCancelBtn} onPress={() => setShowForm(false)}>
                  <Text style={styles.formCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formSubmitBtn, (formRating === 0 || guardandoRev) && { opacity: 0.5 }]}
                  onPress={guardarResena}
                  disabled={formRating === 0 || guardandoRev}
                >
                  {guardandoRev
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.formSubmitText}>Publicar</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* LISTA DE RESEÑAS */}
          {resenasPublicas.length === 0 && !showForm && !miResena && (
            <View style={styles.resenaEmpty}>
              <Text style={styles.resenaEmptyText}>Sé el primero en reseñar este lugar</Text>
            </View>
          )}
          {resenasPublicas.map(r => {
            const nombre = r.profile?.full_name ?? r.profile?.username ?? 'Usuario'
            const ini = nombre.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            const fecha = new Date(r.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
            return (
              <View key={r.id} style={styles.resenaCard}>
                <View style={styles.resenaAvatar}>
                  <Text style={styles.resenaIni}>{ini}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.resenaTop}>
                    <Text style={styles.resenaNombre}>{nombre.split(' ')[0]}</Text>
                    <Text style={styles.resenaFecha}>{fecha}</Text>
                  </View>
                  <Stars rating={r.rating} />
                  {r.text ? <Text style={styles.resenaTexto}>{r.text}</Text> : null}
                </View>
              </View>
            )
          })}
        </View>

        {/* VER EN MAPA */}
        {lugar.latitude && lugar.longitude && (
          <View style={{ flexDirection: 'row', gap: S.md, marginHorizontal: S.xl, marginBottom: S.xl }}>
            <TouchableOpacity
              style={[styles.mapBtn, { flex: 1, backgroundColor: T.purpleSoft, shadowOpacity: 0 }]}
              onPress={() => router.push({ pathname: '/mapa', params: { lugar: lugar.id } })}>
              <MapPin size={16} color={T.purple} />
              <Text style={[styles.mapBtnText, { color: T.purple }]}>Ver en mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mapBtn, { flex: 1 }]} onPress={abrirMaps}>
              <Navigation size={16} color="#fff" />
              <Text style={styles.mapBtnText}>Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.bg },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  notFound:        { fontSize: F.size.lg, color: T.fg3 },
  backLink:        { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.semibold },
  header:          { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { flex: 1, fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  hero:            { height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroEmoji:       { fontSize: 72 },
  heroPhoto:       { width: Dimensions.get('window').width, height: 220 },
  photoBadge:      { position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 },
  photoBadgeText:  { fontSize: F.size.xs, color: '#fff', fontWeight: F.weight.semibold },
  categoryBadge:   { position: 'absolute', bottom: S.lg, paddingHorizontal: S.md, paddingVertical: 4, borderRadius: R.full },
  categoryText:    { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: '#fff' },
  mainInfo:        { backgroundColor: T.surface, padding: S.lg, borderBottomWidth: 1, borderBottomColor: T.border },
  nombre:          { fontSize: F.size.h1, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  ratingRow:       { flexDirection: 'row', alignItems: 'center', gap: S.sm, flexWrap: 'wrap' },
  rating:          { fontSize: F.size.base, color: T.orange, fontWeight: F.weight.bold },
  reviewsCount:    { fontSize: F.size.sm, color: T.fg3 },
  statusBadge:     { paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.full },
  statusText:      { fontSize: F.size.xs, fontWeight: F.weight.semibold },
  description:     { fontSize: F.size.base, color: T.fg2, lineHeight: 22, marginTop: S.md },
  section:         { backgroundColor: T.surface, marginTop: S.md, padding: S.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border },
  sectionTitle:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: 4 },
  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md },
  infoIcon:        { width: 36, height: 36, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoText:        { flex: 1, fontSize: F.size.base, color: T.fg1 },
  horarioRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: T.border },
  horarioDia:      { fontSize: F.size.base, color: T.fg2, textTransform: 'capitalize' },
  horarioHora:     { fontSize: F.size.base, color: T.fg2 },
  mapBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.xl, height: 52, borderRadius: R.lg, backgroundColor: T.purple, shadowColor: T.purple, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  mapBtnText:      { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  // Reseñas
  resenaHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.md },
  resenaSubtitle:  { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  escribirBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.purpleSoft, paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.full },
  escribirBtnText: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  miResenaCard:    { backgroundColor: T.purpleSoft, borderRadius: R.md, padding: S.md, marginBottom: S.md },
  miResenaTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  miResenaBadge:   { backgroundColor: T.purple, paddingHorizontal: S.sm, paddingVertical: 2, borderRadius: R.full },
  miResenaBadgeText: { fontSize: 10, fontWeight: F.weight.bold, color: '#fff' },
  formCard:        { backgroundColor: T.muted, borderRadius: R.md, padding: S.md, marginBottom: S.md, borderWidth: 1, borderColor: T.border },
  formTitle:       { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.md },
  formStars:       { flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md },
  formRatingLabel: { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.orange },
  formInput:       { backgroundColor: T.surface, borderWidth: 1.5, borderColor: T.border, borderRadius: R.md, padding: S.md, fontSize: F.size.base, color: T.fg1, height: 100, textAlignVertical: 'top' },
  formCancelBtn:   { flex: 1, height: 44, borderRadius: R.full, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  formCancelText:  { fontSize: F.size.base, color: T.fg2, fontWeight: F.weight.semibold },
  formSubmitBtn:   { flex: 2, height: 44, borderRadius: R.full, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  formSubmitText:  { fontSize: F.size.base, fontWeight: F.weight.bold, color: '#fff' },
  resenaEmpty:     { paddingVertical: S.lg, alignItems: 'center' },
  resenaEmptyText: { fontSize: F.size.sm, color: T.fg3 },
  resenaCard:      { flexDirection: 'row', gap: S.md, paddingVertical: S.md, borderTopWidth: 1, borderTopColor: T.border },
  resenaAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resenaIni:       { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple },
  resenaTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  resenaNombre:    { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  resenaFecha:     { fontSize: 10, color: T.fg4 },
  resenaTexto:     { fontSize: F.size.sm, color: T.fg2, marginTop: 5, lineHeight: 18 },
})

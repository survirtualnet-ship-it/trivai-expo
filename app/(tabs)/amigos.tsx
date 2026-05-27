import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search, Plus, UserCheck, Clock, Users } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

type Tab = 'todos' | 'amigos' | 'solicitudes'

type Amigo = {
  id: string
  nombre: string
  usuario: string
  online: boolean
  initials: string
}

const sugerencias = [
  { id: 's1', nombre: 'Valentina R.', comunes: 12, color: T.greenSoft,  text: T.greenInk  },
  { id: 's2', nombre: 'Diego L.',     comunes: 8,  color: T.orangeSoft, text: T.orange     },
  { id: 's3', nombre: 'Sofía M.',     comunes: 5,  color: T.purpleSoft, text: T.purple     },
  { id: 's4', nombre: 'Pedro A.',     comunes: 7,  color: T.orangeSoft, text: T.orange     },
]

const solicitudes = [
  { id: 'r1', nombre: 'Roberto V.', usuario: '@roberto.v', comunes: 3, color: T.muted,      text: T.fg2 },
  { id: 'r2', nombre: 'Carmen L.',  usuario: '@carmen.l',  comunes: 7, color: T.purpleSoft, text: T.purple },
]

const actividad = [
  { id: 'a1', quien: 'Carlos', accion: 'asistirá a', nombre: 'Sunset Live',  hora: '2 h', tipo: 'evento', href: '/eventos/1',  detalle: 'Hoy, 20:00 · Terraza Club', color: T.purpleSoft, text: T.purple },
  { id: 'a2', quien: 'Andrea', accion: 'guardó',     nombre: 'Café Central', hora: '4 h', tipo: 'lugar',  href: '/lugares/1', detalle: 'Cafetería · A 0.3 km',       color: T.orangeSoft, text: T.orange },
  { id: 'a3', quien: 'María',  accion: 'asistirá a', nombre: 'Expo Arte',    hora: '6 h', tipo: 'evento', href: '/eventos/4',  detalle: 'Mañana, 18:00 · Galería',    color: T.purpleSoft, text: T.purple },
]

function Avatar({ nombre, color, text, size = 48 }: { nombre: string; color: string; text: string; size?: number }) {
  const ini = nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.36, fontWeight: F.weight.bold, color: text }}>{ini}</Text>
    </View>
  )
}

export default function Amigos() {
  const [tab, setTab]             = useState<Tab>('todos')
  const [amigos, setAmigos]       = useState<Amigo[]>([])
  const [loading, setLoading]     = useState(true)
  const [agregados, setAgregados] = useState<string[]>([])
  const [aceptadas, setAceptadas] = useState<string[]>([])
  const [rechazadas, setRechazadas] = useState<string[]>([])

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('friendships')
        .select('friend:profiles(id, full_name, username)')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
      if (data) {
        setAmigos((data as any[]).filter(d => d.friend?.id).map((d, i) => ({
          id:      d.friend.id,
          nombre:  d.friend.full_name ?? d.friend.username ?? 'Usuario',
          usuario: d.friend.username ? `@${d.friend.username}` : '',
          online:  false,
          initials: (d.friend.full_name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        })))
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const COLORS = [T.greenSoft, T.orangeSoft, T.purpleSoft, T.muted]
  const TEXTS  = [T.greenInk,  T.orange,     T.purple,     T.fg2  ]

  const pendientes = solicitudes.filter(s => !aceptadas.includes(s.id) && !rechazadas.includes(s.id))

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'todos',       label: 'Todos' },
    { id: 'amigos',      label: 'Amigos' },
    { id: 'solicitudes', label: 'Solicitudes', badge: pendientes.length },
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* TAB: TODOS */}
        {tab === 'todos' && (
          <>
            {/* Mis amigos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mis amigos ({amigos.length})</Text>
                <TouchableOpacity><Text style={styles.sectionAction}>Ver todos</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
                {loading
                  ? <ActivityIndicator color={T.purple} />
                  : amigos.map((a, i) => (
                    <View key={a.id} style={styles.friendChip}>
                      <Avatar nombre={a.nombre} color={COLORS[i % 4]} text={TEXTS[i % 4]} size={56} />
                      <Text style={styles.friendChipName} numberOfLines={1}>{a.nombre.split(' ')[0]}</Text>
                    </View>
                  ))
                }
                <View style={styles.friendChip}>
                  <View style={styles.inviteCircle}>
                    <Plus size={22} color={T.purple} />
                  </View>
                  <Text style={styles.friendChipName}>Invitar</Text>
                </View>
              </ScrollView>
            </View>

            {/* Sugerencias */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sugerencias</Text>
                <TouchableOpacity><Text style={styles.sectionAction}>Ver todas</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: S.md, paddingRight: S.lg }}>
                {sugerencias.map(s => (
                  <View key={s.id} style={styles.sugerenciaCard}>
                    <Avatar nombre={s.nombre} color={s.color} text={s.text} size={56} />
                    <Text style={styles.sugerenciaNombre}>{s.nombre}</Text>
                    <Text style={styles.sugerenciaComunes}>{s.comunes} en común</Text>
                    <TouchableOpacity
                      style={[styles.sugerenciaBtn, agregados.includes(s.id) && styles.sugerenciaBtnAdded]}
                      onPress={() => setAgregados(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                    >
                      <Text style={[styles.sugerenciaBtnText, agregados.includes(s.id) && styles.sugerenciaBtnTextAdded]}>
                        {agregados.includes(s.id) ? '✓ Agregado' : 'Agregar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Actividad */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actividad de amigos</Text>
              {actividad.map(a => (
                <View key={a.id} style={styles.actividadRow}>
                  <View style={[styles.actividadIcon, { backgroundColor: a.color }]}>
                    <Text style={{ fontSize: 18 }}>{a.tipo === 'evento' ? '🎟️' : '📍'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actividadText}>
                      <Text style={styles.actividadNombre}>{a.quien} </Text>
                      <Text>{a.accion} </Text>
                      <Text style={{ color: a.text, fontWeight: F.weight.bold }}>{a.nombre}</Text>
                    </Text>
                    <Text style={styles.actividadDetalle}>{a.detalle}</Text>
                  </View>
                  <Text style={styles.actividadHora}>{a.hora}</Text>
                </View>
              ))}
            </View>

            {/* Banner planifica */}
            <View style={styles.planBanner}>
              <View style={styles.planIcon}><Users size={20} color={T.greenInk} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planTitle}>¡Planifica juntos!</Text>
                <Text style={styles.planSub}>Crea un plan y coordina con tus amigos.</Text>
              </View>
              <TouchableOpacity style={styles.planBtn} onPress={() => router.push('/publicar')}>
                <Text style={styles.planBtnText}>Crear plan</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* TAB: AMIGOS */}
        {tab === 'amigos' && (
          <View style={{ padding: S.lg }}>
            {loading
              ? <ActivityIndicator color={T.purple} style={{ marginTop: S.xl }} />
              : amigos.length === 0
                ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>👥</Text>
                    <Text style={styles.emptyTitle}>Aún no tienes amigos</Text>
                    <Text style={styles.emptySub}>Busca personas que conoces para conectar</Text>
                    <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/buscar')}>
                      <Text style={styles.emptyBtnText}>Buscar amigos</Text>
                    </TouchableOpacity>
                  </View>
                )
                : amigos.map((a, i) => (
                  <View key={a.id} style={styles.amigoRow}>
                    <Avatar nombre={a.nombre} color={COLORS[i % 4]} text={TEXTS[i % 4]} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.amigoNombre}>{a.nombre}</Text>
                      <Text style={styles.amigoUsuario}>{a.usuario}</Text>
                    </View>
                    <UserCheck size={20} color={T.green} />
                  </View>
                ))
            }
          </View>
        )}

        {/* TAB: SOLICITUDES */}
        {tab === 'solicitudes' && (
          <View style={{ padding: S.lg, gap: S.md }}>
            {pendientes.length === 0
              ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>✉️</Text>
                  <Text style={styles.emptyTitle}>Sin solicitudes pendientes</Text>
                </View>
              )
              : pendientes.map(s => (
                <View key={s.id} style={styles.solicitudCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, marginBottom: S.md }}>
                    <Avatar nombre={s.nombre} color={s.color} text={s.text} size={48} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.amigoNombre}>{s.nombre}</Text>
                      <Text style={styles.amigoUsuario}>{s.usuario}</Text>
                      <Text style={styles.comunesText}>{s.comunes} amigos en común</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: S.sm }}>
                    <TouchableOpacity
                      style={[styles.solicitudBtn, styles.solicitudBtnAceptar, aceptadas.includes(s.id) && styles.solicitudBtnAceptado]}
                      onPress={() => setAceptadas(p => [...p, s.id])}
                    >
                      <Text style={styles.solicitudBtnAceptarText}>{aceptadas.includes(s.id) ? '✓ Aceptada' : 'Aceptar'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.solicitudBtnRechazar}
                      onPress={() => setRechazadas(p => [...p, s.id])}
                    >
                      <Text style={styles.solicitudBtnRechazarText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            }
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:                   { flex: 1, backgroundColor: T.bg },
  header:                 { backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:                  { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  subtitle:               { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  searchBox:              { flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.surface, marginHorizontal: S.lg, marginTop: S.md, borderRadius: R.full, paddingHorizontal: S.lg, height: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  searchText:             { fontSize: F.size.md, color: T.fg3 },
  tabBar:                 { flexDirection: 'row', backgroundColor: T.surface, marginTop: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:                 { flex: 1, alignItems: 'center' },
  tabLabelRow:            { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: S.md },
  tabLabel:               { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg3 },
  tabLabelActive:         { color: T.green },
  tabLine:                { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabLineActive:          { backgroundColor: T.green },
  badge:                  { width: 18, height: 18, borderRadius: 9, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  badgeText:              { fontSize: 10, fontWeight: F.weight.bold, color: '#fff' },
  section:                { padding: S.lg, paddingBottom: 0 },
  sectionHeader:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md },
  sectionTitle:           { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  sectionAction:          { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  friendChip:             { alignItems: 'center', width: 72 },
  friendChipName:         { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1, marginTop: 6, textAlign: 'center' },
  inviteCircle:           { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: T.purple, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  sugerenciaCard:         { width: 140, backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  sugerenciaNombre:       { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1, marginTop: S.sm, textAlign: 'center' },
  sugerenciaComunes:      { fontSize: F.size.xs, color: T.fg3, marginTop: 2, textAlign: 'center' },
  sugerenciaBtn:          { marginTop: S.sm, width: '100%', height: 32, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  sugerenciaBtnAdded:     { backgroundColor: T.greenSoft },
  sugerenciaBtnText:      { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.purple },
  sugerenciaBtnTextAdded: { color: T.green },
  actividadRow:           { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  actividadIcon:          { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  actividadText:          { fontSize: F.size.sm, color: T.fg1, lineHeight: 18 },
  actividadNombre:        { fontWeight: F.weight.bold },
  actividadDetalle:       { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  actividadHora:          { fontSize: F.size.xs, color: T.fg3 },
  planBanner:             { flexDirection: 'row', alignItems: 'center', gap: S.md, margin: S.lg, backgroundColor: T.greenSoft, borderRadius: R.lg, padding: S.md },
  planIcon:               { width: 40, height: 40, borderRadius: R.md, backgroundColor: 'rgba(33,162,74,0.15)', alignItems: 'center', justifyContent: 'center' },
  planTitle:              { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  planSub:                { fontSize: F.size.xs, color: T.fg2, marginTop: 2 },
  planBtn:                { paddingHorizontal: S.md, paddingVertical: 8, backgroundColor: T.green, borderRadius: R.full },
  planBtnText:            { fontSize: F.size.xs, fontWeight: F.weight.bold, color: '#fff' },
  amigoRow:               { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  amigoNombre:            { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  amigoUsuario:           { fontSize: F.size.sm, color: T.fg3 },
  comunesText:            { fontSize: F.size.xs, color: T.purple, marginTop: 2 },
  solicitudCard:          { backgroundColor: T.surface, borderRadius: R.lg, padding: S.md, borderWidth: 1, borderColor: T.border },
  solicitudBtn:           { flex: 1, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  solicitudBtnAceptar:    { backgroundColor: T.green },
  solicitudBtnAceptado:   { backgroundColor: T.greenSoft },
  solicitudBtnAceptarText:{ fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  solicitudBtnRechazar:   { flex: 1, height: 40, borderRadius: R.md, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center' },
  solicitudBtnRechazarText:{ fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  emptyState:             { alignItems: 'center', paddingVertical: 48, gap: S.md },
  emptyEmoji:             { fontSize: 40 },
  emptyTitle:             { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  emptySub:               { fontSize: F.size.sm, color: T.fg3, textAlign: 'center' },
  emptyBtn:               { paddingHorizontal: S.xl, paddingVertical: S.md, backgroundColor: T.purple, borderRadius: R.full },
  emptyBtnText:           { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
})

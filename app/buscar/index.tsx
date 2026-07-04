import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { X, Search } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'
import { dedupePlaces } from '@/lib/places'

type Tab = 'todos' | 'lugares' | 'eventos' | 'personas'
type Tendencia = { texto: string; tipo: string; emoji: string; href: string }

const PERSON_COLORS = [T.greenSoft, T.orangeSoft, T.purpleSoft, T.muted]
const PERSON_TEXTS  = [T.greenInk,  T.orangeInk,  T.purple,     T.fg2  ]

const CATEGORIAS = [
  { emoji: '📍', label: 'Lugares',  href: '/lugares',       color: '#1a1a2e' },
  { emoji: '🎟️', label: 'Eventos', href: '/eventos',       color: '#1a0533' },
  { emoji: '👥', label: 'Personas', href: '/amigos',        color: '#0a2a0a' },
  { emoji: '🗺️', label: 'Mapa',    href: '/mapa',          color: '#2D1B0E' },
]

function formatFechaCorta(dt: string) {
  return new Date(dt).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function highlight(text: string, q: string) {
  if (!q) return <Text>{text}</Text>
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <Text>{text}</Text>
  return (
    <Text>
      {text.slice(0, idx)}
      <Text style={{ backgroundColor: T.purpleSoft, color: T.purple }}>{text.slice(idx, idx + q.length)}</Text>
      {text.slice(idx + q.length)}
    </Text>
  )
}

export default function Buscar() {
  const [query,      setQuery]      = useState('')
  const [tab,        setTab]        = useState<Tab>('todos')
  const [lugares,    setLugares]    = useState<any[]>([])
  const [eventos,    setEventos]    = useState<any[]>([])
  const [personas,   setPersonas]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(false)
  const [tendencias, setTendencias] = useState<Tendencia[]>([])
  const inputRef                    = useRef<TextInput>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    const cargarTendencias = async () => {
      const [{ data: topLug }, { data: proxEvt }] = await Promise.all([
        supabase.from('places').select('id, name, category, rating_avg')
          .not('rating_avg', 'is', null)
          .order('rating_avg', { ascending: false })
          .limit(2),
        supabase.from('events').select('id, name, category, start_datetime')
          .eq('is_active', true)
          .gte('start_datetime', new Date().toISOString())
          .order('start_datetime', { ascending: true })
          .limit(2),
      ])
      const items: Tendencia[] = [
        ...dedupePlaces(topLug ?? []).map((l: any) => ({
          texto: l.name,
          tipo:  l.category + (l.rating_avg ? ' · ★ ' + Number(l.rating_avg).toFixed(1) : ''),
          emoji: getCatEmoji(l.category),
          href:  '/lugares/' + l.id,
        })),
        ...(proxEvt ?? []).map((e: any) => ({
          texto: e.name,
          tipo:  'Evento · ' + formatFechaCorta(e.start_datetime),
          emoji: getCatEmoji(e.category),
          href:  '/eventos/' + e.id,
        })),
      ]
      if (items.length > 0) setTendencias(items)
    }
    cargarTendencias()
  }, [])

  useEffect(() => {
    if (!query.trim()) { setLugares([]); setEventos([]); setPersonas([]); return }
    const timer = setTimeout(buscar, 300)
    return () => clearTimeout(timer)
  }, [query])

  async function buscar() {
    setLoading(true)
    const q = query.trim()
    const [{ data: lug }, { data: evt }, { data: per }] = await Promise.all([
      supabase.from('places').select('id, name, category, address, rating_avg, is_open').ilike('name', `%${q}%`).limit(10),
      supabase.from('events').select('id, name, category, start_datetime, is_free, price').ilike('name', `%${q}%`).eq('is_active', true).limit(10),
      supabase.from('profiles').select('id, full_name, username, avatar_url').or(`full_name.ilike.%${q}%,username.ilike.%${q}%`).limit(8),
    ])
    setLugares(dedupePlaces(lug ?? []))
    setEventos(evt ?? [])
    setPersonas((per ?? []).map((p: any, i: number) => ({
      id:     p.id,
      nombre: p.full_name ?? p.username ?? 'Usuario',
      usuario: p.username ?? '',
      color:  PERSON_COLORS[i % 4],
      text:   PERSON_TEXTS[i % 4],
      ini:    (p.full_name ?? p.username ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    })))
    setLoading(false)
  }

  const q = query.trim().toLowerCase()
  const rPersonas = personas
  const total = lugares.length + eventos.length + rPersonas.length

  const mostrarLugares  = (tab === 'todos' || tab === 'lugares')  && lugares.length > 0
  const mostrarEventos  = (tab === 'todos' || tab === 'eventos')  && eventos.length > 0
  const mostrarPersonas = (tab === 'todos' || tab === 'personas') && rPersonas.length > 0

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'todos',    label: 'Todos',    count: total         },
    { id: 'lugares',  label: 'Lugares',  count: lugares.length },
    { id: 'eventos',  label: 'Eventos',  count: eventos.length },
    { id: 'personas', label: 'Personas', count: rPersonas.length },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <ScreenHeader title="Buscar" fallbackHref="/" />

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.header}>
        <View style={[styles.inputWrap, q && styles.inputWrapActive]}>
          <Search size={16} color={q ? T.purple : T.fg3} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar lugares, eventos o personas..."
            placeholderTextColor={T.fg4}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={T.fg3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* TABS — solo si hay búsqueda */}
      {q.length > 0 && (
        <View style={styles.tabBar}>
          {tabs.map(t => (
            <TouchableOpacity key={t.id} style={styles.tabBtn} onPress={() => setTab(t.id)}>
              <View style={styles.tabRow}>
                <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
                {t.count > 0 && (
                  <View style={[styles.tabCount, tab === t.id && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, tab === t.id && styles.tabCountTextActive]}>{t.count}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.tabLine, tab === t.id && styles.tabLineActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ESTADO VACÍO */}
        {q.length === 0 && (
          <View style={{ padding: S.lg }}>
            <Text style={styles.sectionLabel}>Explorar categorías</Text>
            <View style={styles.catGrid}>
              {CATEGORIAS.map(c => (
                <TouchableOpacity key={c.label} style={[styles.catCard, { backgroundColor: c.color }]} onPress={() => router.push(c.href as any)}>
                  <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
                  <Text style={styles.catLabel}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: S.lg }]}>Tendencias en Santa Cruz</Text>
            {tendencias.length === 0
              ? <ActivityIndicator color={T.purple} style={{ marginTop: S.md }} />
              : tendencias.map(t => (
                <TouchableOpacity key={t.href} style={styles.tendenciaRow} onPress={() => router.push(t.href as any)}>
                  <View style={styles.tendenciaIcon}><Text style={{ fontSize: 18 }}>{t.emoji}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tendenciaNombre}>{t.texto}</Text>
                    <Text style={styles.tendenciaTipo}>{t.tipo}</Text>
                  </View>
                  <Text style={{ color: T.fg4, fontSize: 16 }}>›</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        )}

        {/* RESULTADOS */}
        {q.length > 0 && (
          <View style={{ padding: S.lg, gap: S.xl }}>
            {loading && <ActivityIndicator color={T.purple} />}

            {!loading && total === 0 && (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40 }}>🔍</Text>
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptySub}>No encontramos nada para "{query}"</Text>
              </View>
            )}

            {/* LUGARES */}
            {mostrarLugares && (
              <View>
                <Text style={styles.resultLabel}>LUGARES · {lugares.length}</Text>
                {(tab === 'todos' ? lugares.slice(0, 3) : lugares).map(l => (
                  <TouchableOpacity key={l.id} style={styles.resultRow} onPress={() => router.push(`/lugares/${l.id}`)}>
                    <View style={[styles.resultIcon, { backgroundColor: getCatColor(l.category) + '22' }]}>
                      <Text style={{ fontSize: 22 }}>{getCatEmoji(l.category)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultNombre}>{highlight(l.name, query)}</Text>
                      <Text style={styles.resultSub}>{highlight(l.category, query)}</Text>
                      <Text style={[styles.resultSub, { color: l.is_open ? T.green : T.danger }]}>{l.is_open ? 'Abierto' : 'Cerrado'}</Text>
                    </View>
                    <Text style={styles.resultRating}>★ {l.rating_avg?.toFixed(1) ?? '—'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* EVENTOS */}
            {mostrarEventos && (
              <View>
                <Text style={styles.resultLabel}>EVENTOS · {eventos.length}</Text>
                {(tab === 'todos' ? eventos.slice(0, 3) : eventos).map(e => (
                  <TouchableOpacity key={e.id} style={styles.resultRow} onPress={() => router.push(`/eventos/${e.id}`)}>
                    <View style={[styles.resultIcon, { backgroundColor: T.purpleSoft }]}>
                      <Text style={{ fontSize: 22 }}>{getCatEmoji(e.category)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultNombre}>{highlight(e.name, query)}</Text>
                      <Text style={[styles.resultSub, { color: T.purple }]}>{highlight(e.category, query)}</Text>
                    </View>
                    <Text style={[styles.resultRating, { color: e.is_free ? T.green : T.orange }]}>
                      {e.is_free ? 'Gratis' : `Bs. ${e.price}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PERSONAS */}
            {mostrarPersonas && (
              <View>
                <Text style={styles.resultLabel}>PERSONAS · {rPersonas.length}</Text>
                {(tab === 'todos' ? rPersonas.slice(0, 3) : rPersonas).map(p => (
                  <TouchableOpacity key={p.id} style={styles.resultRow} onPress={() => router.push(`/perfil/${p.id}`)}>
                    <View style={[styles.resultAvatar, { backgroundColor: p.color }]}>
                      <Text style={{ fontSize: 18, fontWeight: F.weight.bold, color: p.text }}>{p.ini}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultNombre}>{highlight(p.nombre, query)}</Text>
                      <Text style={styles.resultSub}>@{highlight(p.usuario, query)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.lg, paddingTop: S.sm, paddingBottom: S.md },
  inputWrap:         { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, backgroundColor: T.bg, borderRadius: R.md, paddingHorizontal: S.md, height: 44, borderWidth: 1.5, borderColor: 'transparent' },
  inputWrapActive:   { borderColor: T.purple, backgroundColor: T.surface },
  input:             { flex: 1, fontSize: F.size.md, color: T.fg1 },
  tabBar:            { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:            { flex: 1, alignItems: 'center' },
  tabRow:            { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: S.md },
  tabLabel:          { fontSize: F.size.xs, fontWeight: F.weight.semibold, color: T.fg3 },
  tabLabelActive:    { color: T.purple },
  tabCount:          { paddingHorizontal: 5, paddingVertical: 1, borderRadius: R.sm, backgroundColor: T.muted },
  tabCountActive:    { backgroundColor: T.purpleSoft },
  tabCountText:      { fontSize: 10, color: T.fg3 },
  tabCountTextActive:{ color: T.purple },
  tabLine:           { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabLineActive:     { backgroundColor: T.purple },
  sectionLabel:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg3, marginBottom: S.md },
  catGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  catCard:           { width: '48%', borderRadius: R.lg, padding: S.lg, flexDirection: 'row', alignItems: 'center', gap: S.sm },
  catLabel:          { fontSize: F.size.md, fontWeight: F.weight.bold, color: '#fff' },
  tendenciaRow:      { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  tendenciaIcon:     { width: 36, height: 36, borderRadius: R.sm, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  tendenciaNombre:   { fontSize: F.size.md, fontWeight: F.weight.semibold, color: T.fg1 },
  tendenciaTipo:     { fontSize: F.size.xs, color: T.fg3 },
  resultLabel:       { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg3, marginBottom: S.sm, letterSpacing: 0.5 },
  resultRow:         { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.sm },
  resultIcon:        { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  resultAvatar:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  resultNombre:      { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  resultSub:         { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
  resultRating:      { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.orange },
  emptyState:        { alignItems: 'center', paddingVertical: 48, gap: S.md },
  emptyTitle:        { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1 },
  emptySub:          { fontSize: F.size.sm, color: T.fg3, textAlign: 'center' },
})

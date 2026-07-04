import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import ScreenHeader from '@/components/ScreenHeader'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji } from '@/lib/tokens'

type Tab = 'todos' | 'lugares' | 'eventos'

type Item = {
  id: string
  nombre: string
  tipo: 'Lugar' | 'Evento'
  sub: string
  emoji: string
  href: string
}

export default function Favoritos() {
  const [items, setItems]     = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('todos')

  useEffect(() => {
    async function cargar() {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('favorites')
        .select('place:places(id, name, category)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setItems((data as any[]).filter(f => f.place?.id).map(f => ({
          id:     String(f.place.id),
          nombre: f.place.name,
          tipo:   'Lugar' as const,
          sub:    f.place.category + ' · SC',
          emoji:  getCatEmoji(f.place.category),
          href:   `/lugares/${f.place.id}`,
        })))
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const filtrados = tab === 'todos' ? items : items.filter(i => i.tipo.toLowerCase() === (tab === 'lugares' ? 'lugar' : 'evento'))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'todos',   label: 'Todos'   },
    { id: 'lugares', label: 'Lugares' },
    { id: 'eventos', label: 'Eventos' },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <ScreenHeader title="Mis favoritos" />

      {/* TABS */}
      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.id} style={styles.tabBtn} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
            <View style={[styles.tabLine, tab === t.id && styles.tabLineActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.purple} size="large" /></View>
      ) : filtrados.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 40, marginBottom: S.md }}>❤️</Text>
          <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
          <Text style={styles.emptySub}>Guarda lugares y eventos para verlos aquí</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/lugares')}>
            <Text style={styles.emptyBtnText}>Explorar →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: S.lg }}>
          <Text style={styles.countText}>{filtrados.length} guardado{filtrados.length !== 1 ? 's' : ''}</Text>
          {filtrados.map(item => (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push(item.href as any)}>
              <View style={[styles.itemIcon, { backgroundColor: item.tipo === 'Evento' ? T.purpleSoft : T.muted }]}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNombre}>{item.nombre}</Text>
                <Text style={styles.itemSub}>{item.sub}</Text>
                <View style={[styles.badge, { backgroundColor: (item.tipo === 'Evento' ? T.purple : T.fg2) + '22' }]}>
                  <Text style={[styles.badgeText, { color: item.tipo === 'Evento' ? T.purple : T.fg2 }]}>{item.tipo}</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:         { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  tabBar:        { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBtn:        { flex: 1, alignItems: 'center' },
  tabLabel:      { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg3, paddingVertical: S.md },
  tabLabelActive:{ color: T.orange },
  tabLine:       { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabLineActive: { backgroundColor: T.orange },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl },
  emptyTitle:    { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  emptySub:      { fontSize: F.size.sm, color: T.fg3, textAlign: 'center', marginTop: S.sm },
  emptyBtn:      { marginTop: S.md, paddingHorizontal: S.xl, paddingVertical: S.md, backgroundColor: T.purple, borderRadius: R.full },
  emptyBtnText:  { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  countText:     { fontSize: F.size.sm, color: T.fg3, marginBottom: S.md },
  itemCard:      { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border, padding: S.md, marginBottom: S.sm },
  itemIcon:      { width: 64, height: 64, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemNombre:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  itemSub:       { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  badge:         { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: S.sm, paddingVertical: 2, borderRadius: R.sm },
  badgeText:     { fontSize: 10, fontWeight: F.weight.bold },
  arrow:         { fontSize: 20, color: T.fg4 },
})

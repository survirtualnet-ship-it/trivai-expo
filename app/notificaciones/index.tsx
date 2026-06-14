import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'

type Notif = {
  id: string
  tipo: string
  texto: string
  detalle: string
  createdAt: string
  leida: boolean
  emoji: string
  href: string
}

const COLORS: Record<string, { bg: string; color: string }> = {
  evento: { bg: T.purpleSoft, color: T.purple },
  amigo:  { bg: T.greenSoft,  color: T.greenInk },
  lugar:  { bg: T.orangeSoft, color: T.orange   },
  system: { bg: T.muted,      color: T.fg3       },
}

function tiempoRelativo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const horas = Math.floor(mins / 60)
  const dias  = Math.floor(horas / 24)
  if (mins  <  1) return 'Ahora'
  if (mins  < 60) return `Hace ${mins} min`
  if (horas < 24) return `Hace ${horas}h`
  if (dias  ===1) return 'Ayer'
  return `Hace ${dias} días`
}

export default function Notificaciones() {
  const [notifs,  setNotifs]  = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data && data.length > 0) {
      setNotifs(data.map((n: any) => ({
        id:        n.id,
        tipo:      n.type ?? 'system',
        texto:     n.title,
        detalle:   n.body ?? '',
        createdAt: n.created_at,
        leida:     n.is_read,
        emoji:     n.data?.emoji ?? '🔔',
        href:      n.data?.href ?? '/',
      })))
    }
    setLoading(false)
  }

  const marcarLeida = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  const marcarTodas = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false)
  }

  const sinLeer = notifs.filter(n => !n.leida).length

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        {sinLeer > 0
          ? <TouchableOpacity onPress={marcarTodas}><Text style={styles.leerTodas}>Leer todas</Text></TouchableOpacity>
          : <View style={{ width: 70 }} />
        }
      </View>

      {/* BADGE SIN LEER */}
      {!loading && sinLeer > 0 && (
        <View style={styles.sinLeerBadge}>
          <Text style={styles.sinLeerText}>{sinLeer} notificación{sinLeer > 1 ? 'es' : ''} sin leer</Text>
        </View>
      )}

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={T.purple} size="large" />
        </View>
      )}

      {!loading && notifs.length === 0 && (
        <View style={styles.center}>
          <View style={styles.emptyIcon}><Text style={{ fontSize: 32 }}>🔔</Text></View>
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptySub}>Aquí aparecerán alertas de eventos,{'\n'}amigos y lugares cercanos</Text>
        </View>
      )}

      {!loading && notifs.length > 0 && (
        <ScrollView contentContainerStyle={{ padding: S.lg, gap: S.sm }}>
          {notifs.map(n => {
            const c = COLORS[n.tipo] ?? COLORS.system
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifCard, n.leida ? styles.notifLeida : styles.notifNueva]}
                onPress={() => { if (!n.leida) marcarLeida(n.id); const h = n.href; if (h && h !== '/') router.push(h as any) }}
              >
                <View style={[styles.notifIcon, { backgroundColor: c.bg }]}>
                  <Text style={{ fontSize: 22 }}>{n.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.notifTexto, !n.leida && { fontWeight: F.weight.bold }]}>{n.texto}</Text>
                  {n.detalle ? <Text style={styles.notifDetalle}>{n.detalle}</Text> : null}
                  <Text style={styles.notifTiempo}>{tiempoRelativo(n.createdAt)}</Text>
                </View>
                {!n.leida && <View style={styles.dotNueva} />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:        { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  leerTodas:    { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.purple, padding: 4 },
  sinLeerBadge: { margin: S.lg, marginBottom: 0, padding: S.md, backgroundColor: T.purpleSoft, borderRadius: R.md },
  sinLeerText:  { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.purple },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.xl },
  emptyIcon:    { width: 72, height: 72, borderRadius: 20, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  emptyTitle:   { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, textAlign: 'center' },
  emptySub:     { fontSize: F.size.sm, color: T.fg3, textAlign: 'center', lineHeight: 20, marginTop: S.sm },
  notifCard:    { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderRadius: R.lg, marginBottom: S.sm },
  notifLeida:   { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  notifNueva:   { backgroundColor: '#FAFAFF', borderWidth: 1.5, borderColor: T.purpleSoft },
  notifIcon:    { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTexto:   { fontSize: F.size.sm, color: T.fg1, lineHeight: 18 },
  notifDetalle: { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  notifTiempo:  { fontSize: F.size.xs, color: T.fg4, marginTop: 4 },
  dotNueva:     { width: 8, height: 8, borderRadius: 4, backgroundColor: T.purple, flexShrink: 0 },
})

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { router } from 'expo-router'
import { Navigation, MapPin } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'

interface Marcador {
  id: string; name: string; category: string
  lat: number; lng: number; tipo: 'lugar' | 'evento'
}

const SANTA_CRUZ = { lat: -17.7833, lng: -63.1821 }

type Filtro = 'restaurantes' | 'cafes' | 'arte' | 'otros' | 'eventos'

const FILTROS: { id: Filtro; label: string; emoji: string; color: string }[] = [
  { id: 'restaurantes', label: 'Restaurantes', emoji: '🍽️', color: T.orange  },
  { id: 'cafes',        label: 'Cafés',        emoji: '☕', color: '#8B4513' },
  { id: 'arte',         label: 'Arte',         emoji: '🎨', color: T.purple  },
  { id: 'otros',        label: 'Otros',        emoji: '📍', color: T.fg2     },
  { id: 'eventos',      label: 'Eventos',      emoji: '🎟️', color: T.green   },
]

const CAT_FILTRO: Record<string, Filtro> = {
  'Restaurante': 'restaurantes', 'Gastronomía': 'restaurantes',
  'Cafetería': 'cafes',
  'Arte y cultura': 'arte', 'Arte': 'arte', 'Música': 'arte',
  'Entretenimiento': 'eventos',
}

function catFiltro(cat: string): Filtro {
  return CAT_FILTRO[cat] ?? 'otros'
}

function buildMapHTML(marcadores: Marcador[], centro: { lat: number; lng: number }, apiKey: string) {
  const pinsJS = marcadores.map(m => {
    const color = m.tipo === 'evento' ? '#21A24A'
      : m.category === 'Restaurante' || m.category === 'Gastronomía' ? '#F26B1F'
      : m.category === 'Cafetería' ? '#8B4513'
      : m.category === 'Arte y cultura' || m.category === 'Arte' ? '#6D28FF'
      : '#8A8590'
    return `
      new google.maps.Marker({
        position: { lat: ${m.lat}, lng: ${m.lng} },
        map: map,
        title: ${JSON.stringify(m.name)},
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '${color}',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        }
      });`
  }).join('\n')

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%}</style>
</head><body>
<div id="map"></div>
<script>
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: ${centro.lat}, lng: ${centro.lng} },
    zoom: 14,
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { featureType:'poi', elementType:'labels', stylers:[{visibility:'off'}] }
    ]
  });
  ${pinsJS}
}
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body></html>`
}

export default function Mapa() {
  const [marcadores, setMarcadores] = useState<Marcador[]>([])
  const [todos,      setTodos]      = useState<Marcador[]>([])
  const [filtro,     setFiltro]     = useState<Filtro>('restaurantes')
  const [centro,     setCentro]     = useState(SANTA_CRUZ)
  const [loading,    setLoading]    = useState(true)
  const [seleccionado, setSeleccionado] = useState<Marcador | null>(null)

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? ''

  useEffect(() => {
    const fetch = async () => {
      const [{ data: places }, { data: events }] = await Promise.all([
        supabase.from('places').select('id,name,category,latitude,longitude')
          .not('latitude', 'is', null).not('longitude', 'is', null),
        supabase.from('events').select('id,name,category,start_datetime')
          .eq('is_active', true).gte('start_datetime', new Date().toISOString()),
      ])

      const mLugares: Marcador[] = (places ?? []).map(p => ({
        id: p.id, tipo: 'lugar' as const,
        name: p.name, category: p.category,
        lat: p.latitude, lng: p.longitude,
      }))

      const mEventos: Marcador[] = (events ?? []).map((e, i) => ({
        id: e.id, tipo: 'evento' as const,
        name: e.name, category: e.category,
        lat: SANTA_CRUZ.lat + Math.sin(i * 1.3) * 0.02,
        lng: SANTA_CRUZ.lng + Math.cos(i * 1.3) * 0.02,
      }))

      const lista = [...mLugares, ...mEventos]
      setTodos(lista)
      aplicarFiltro(lista, 'restaurantes')
      setLoading(false)
    }
    fetch()
  }, [])

  function aplicarFiltro(lista: Marcador[], f: Filtro) {
    const filtrados = f === 'eventos'
      ? lista.filter(m => m.tipo === 'evento' || m.category === 'Entretenimiento')
      : lista.filter(m => m.tipo === 'lugar' && catFiltro(m.category) === f)
    setMarcadores(filtrados)
    setFiltro(f)
    setSeleccionado(null)
  }

  const mapHTML = buildMapHTML(marcadores, centro, apiKey)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* TOPBAR */}
      <View style={styles.topbar}>
        <Text style={styles.title}>Mapa</Text>
        <TouchableOpacity style={styles.locBtn} onPress={() => {
          setCentro(SANTA_CRUZ)
          setSeleccionado(null)
        }}>
          <Navigation size={16} color={T.purple} />
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros} style={styles.filtrosWrap}>
        {FILTROS.map(f => (
          <TouchableOpacity key={f.id}
            style={[styles.chip, filtro === f.id && { backgroundColor: f.color }]}
            onPress={() => aplicarFiltro(todos, f.id)}>
            <Text style={styles.chipEmoji}>{f.emoji}</Text>
            <Text style={[styles.chipText, filtro === f.id && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{loading ? '...' : `${marcadores.length}`}</Text>
      </ScrollView>

      {/* MAPA */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={T.purple} />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        ) : !apiKey ? (
          <View style={styles.center}>
            <Text style={{ fontSize: 32 }}>🗺️</Text>
            <Text style={styles.loadingText}>API key no configurada</Text>
          </View>
        ) : (
          <WebView
            source={{ html: mapHTML }}
            style={{ flex: 1 }}
            scrollEnabled={false}
            javaScriptEnabled
          />
        )}

        {/* POPUP marcador seleccionado */}
        {seleccionado && (
          <View style={styles.popup}>
            <View style={[styles.popupIcon, { backgroundColor: getCatColor(seleccionado.category) + '33' }]}>
              <Text style={{ fontSize: 22 }}>{getCatEmoji(seleccionado.category)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.popupName} numberOfLines={1}>{seleccionado.name}</Text>
              <Text style={styles.popupCat}>{seleccionado.category}</Text>
            </View>
            <TouchableOpacity style={styles.popupBtn}
              onPress={() => router.push(seleccionado.tipo === 'evento'
                ? `/eventos/${seleccionado.id}` : `/lugares/${seleccionado.id}`)}>
              <Text style={{ color: '#fff', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupClose}
              onPress={() => setSeleccionado(null)}>
              <Text style={{ color: T.fg3, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  topbar:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:        { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  locBtn:       { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  filtrosWrap:  { backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, maxHeight: 52 },
  filtros:      { paddingHorizontal: S.lg, paddingVertical: S.sm, gap: S.sm, alignItems: 'center' },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: S.md, paddingVertical: 6, borderRadius: R.full, backgroundColor: T.muted },
  chipEmoji:    { fontSize: 13 },
  chipText:     { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  count:        { fontSize: F.size.sm, color: T.fg3, marginLeft: S.sm },
  mapContainer: { flex: 1, position: 'relative' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  loadingText:  { fontSize: F.size.base, color: T.fg3 },
  popup:        { position: 'absolute', bottom: 24, left: S.lg, right: S.lg, backgroundColor: T.surface, borderRadius: 20, padding: S.lg, flexDirection: 'row', alignItems: 'center', gap: S.md, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10 },
  popupIcon:    { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  popupName:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  popupCat:     { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  popupBtn:     { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center' },
  popupClose:   { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
})

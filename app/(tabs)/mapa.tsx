import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { MapEmbed } from '@/components/MapEmbed'
import { Navigation } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, getCatEmoji, getCatColor } from '@/lib/tokens'

interface Marcador {
  id: string; name: string; category: string
  lat: number; lng: number; tipo: 'lugar' | 'evento'
}

const SANTA_CRUZ = { lat: -17.7833, lng: -63.1821 }

type Filtro = 'todos' | 'restaurantes' | 'cafes' | 'arte' | 'otros' | 'eventos'

const FILTROS: { id: Filtro; label: string; emoji: string; color: string }[] = [
  { id: 'todos',        label: 'Todos',        emoji: '🗺️', color: T.fg2     },
  { id: 'restaurantes', label: 'Restaurantes', emoji: '🍽️', color: T.orange  },
  { id: 'cafes',        label: 'Cafés',        emoji: '☕', color: '#8B4513' },
  { id: 'arte',         label: 'Arte',         emoji: '🎨', color: T.purple  },
  { id: 'eventos',      label: 'Eventos',      emoji: '🎟️', color: T.green   },
  { id: 'otros',        label: 'Otros',        emoji: '📍', color: T.fg3     },
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

function markerColor(m: Marcador): string {
  if (m.tipo === 'evento') return '#21A24A'
  const f = catFiltro(m.category)
  if (f === 'restaurantes') return '#F26B1F'
  if (f === 'cafes')        return '#8B4513'
  if (f === 'arte')         return '#6D28FF'
  return '#8A8590'
}

function buildMapHTML(
  marcadores: Marcador[],
  centro: { lat: number; lng: number },
  apiKey: string,
  selId?: string,
  userPos?: { lat: number; lng: number } | null,
) {
  // Define all marker data as a JS object for click handlers
  const markersDataJS = `var __markers = {
${marcadores.map(m => `  ${JSON.stringify(m.id)}: ${JSON.stringify({
    id: m.id, name: m.name, category: m.category, tipo: m.tipo, lat: m.lat, lng: m.lng,
  })}`).join(',\n')}
};`

  const pinsJS = marcadores.map(m => {
    const color  = markerColor(m)
    const scale  = m.id === selId ? 13 : 9
    const stroke = m.id === selId ? 3 : 2
    return `(function() {
      var mk = new google.maps.Marker({
        position: { lat: ${m.lat}, lng: ${m.lng} },
        map: map,
        title: ${JSON.stringify(m.name)},
        zIndex: ${m.id === selId ? 999 : 1},
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: ${scale},
          fillColor: '${color}',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: ${stroke},
        }
      });
      mk.addListener('click', function() {
        var msg = JSON.stringify(__markers[${JSON.stringify(m.id)}]);
        if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(msg); }
        else { window.parent.postMessage(msg, '*'); }
      });
    })();`
  }).join('\n')

  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%}</style>
</head><body>
<div id="map"></div>
<script>
${markersDataJS}
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: ${centro.lat}, lng: ${centro.lng} },
    zoom: ${selId ? 15 : 14},
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      { featureType:'poi', elementType:'labels', stylers:[{visibility:'off'}] }
    ]
  });
  ${pinsJS}
  ${userPos ? `new google.maps.Marker({
    position:{lat:${userPos.lat},lng:${userPos.lng}},
    map:map,zIndex:2000,
    title:'Tu ubicación',
    icon:{path:google.maps.SymbolPath.CIRCLE,scale:9,fillColor:'#4285F4',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}
  });` : ''}
}
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body></html>`
}

export default function Mapa() {
  const params = useLocalSearchParams<{ lugar?: string; lat?: string; lng?: string; zona?: string }>()

  const [todos,        setTodos]        = useState<Marcador[]>([])
  const [marcadores,   setMarcadores]   = useState<Marcador[]>([])
  const [filtro,       setFiltro]       = useState<Filtro>('todos')
  const [centro,       setCentro]       = useState(SANTA_CRUZ)
  const [loading,      setLoading]      = useState(true)
  const [seleccionado, setSeleccionado] = useState<Marcador | null>(null)
  const [userPos,      setUserPos]      = useState<{ lat: number; lng: number } | null>(null)

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? ''

  // Carga inicial de datos
  useEffect(() => {
    const fetch = async () => {
      const [{ data: places }, { data: events }] = await Promise.all([
        supabase.from('places').select('id,name,category,latitude,longitude')
          .not('latitude', 'is', null).not('longitude', 'is', null),
        supabase.from('events').select('id,name,category,start_datetime,place:places(latitude,longitude)')
          .eq('is_active', true).gte('start_datetime', new Date().toISOString()),
      ])

      const mLugares: Marcador[] = (places ?? []).map(p => ({
        id: p.id, tipo: 'lugar' as const,
        name: p.name, category: p.category,
        lat: p.latitude, lng: p.longitude,
      }))

      // Eventos solo aparecen si su lugar tiene coordenadas reales
      const mEventos: Marcador[] = (events ?? [])
        .filter((e: any) => e.place?.latitude && e.place?.longitude)
        .map((e: any) => ({
          id: e.id, tipo: 'evento' as const,
          name: e.name, category: e.category,
          lat: e.place.latitude, lng: e.place.longitude,
        }))

      const lista = [...mLugares, ...mEventos]
      setTodos(lista)
      setMarcadores(lista)
      setLoading(false)
    }
    fetch()
  }, [])

  // URL param: ?lugar=UUID → centra y selecciona ese lugar
  useEffect(() => {
    if (!params.lugar || todos.length === 0) return
    const found = todos.find(m => m.id === params.lugar && m.tipo === 'lugar')
    if (found) {
      setCentro({ lat: found.lat, lng: found.lng })
      setSeleccionado(found)
    }
  }, [params.lugar, todos])

  // URL param: ?lat=X&lng=Y&zona=Nombre → centra el mapa en esas coords
  useEffect(() => {
    if (params.lat && params.lng) {
      setCentro({ lat: Number(params.lat), lng: Number(params.lng) })
    }
  }, [params.lat, params.lng])

  function aplicarFiltro(f: Filtro) {
    const filtrados = f === 'todos'     ? todos
      : f === 'eventos' ? todos.filter(m => m.tipo === 'evento')
      : todos.filter(m => m.tipo === 'lugar' && catFiltro(m.category) === f)
    setMarcadores(filtrados)
    setFiltro(f)
    setSeleccionado(null)
  }

  const handleMapMessage = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed?.id) setSeleccionado(parsed as Marcador)
    } catch {}
  }, [])

  const mapHTML = buildMapHTML(marcadores, centro, apiKey, seleccionado?.id, userPos)

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* TOPBAR */}
      <View style={styles.topbar}>
        <Text style={styles.title}>
          {params.zona ? params.zona : 'Mapa'}
        </Text>
        <TouchableOpacity style={[styles.locBtn, userPos && { backgroundColor: T.purple }]} onPress={() => {
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              pos => {
                const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setUserPos(p)
                setCentro(p)
                setSeleccionado(null)
              },
              () => { setCentro(SANTA_CRUZ); setSeleccionado(null) },
              { timeout: 8000 }
            )
          } else {
            setCentro(SANTA_CRUZ); setSeleccionado(null)
          }
        }}>
          <Navigation size={16} color={userPos ? '#fff' : T.purple} />
        </TouchableOpacity>
      </View>

      {/* FILTROS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros} style={styles.filtrosWrap}>
        {FILTROS.map(f => (
          <TouchableOpacity key={f.id}
            style={[styles.chip, filtro === f.id && { backgroundColor: f.color, borderColor: f.color }]}
            onPress={() => aplicarFiltro(f.id)}>
            <Text style={styles.chipEmoji}>{f.emoji}</Text>
            <Text style={[styles.chipText, filtro === f.id && { color: '#fff' }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{loading ? '·' : marcadores.length}</Text>
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
          <MapEmbed html={mapHTML} onMessage={handleMapMessage} />
        )}

        {/* POPUP marcador seleccionado */}
        {seleccionado && (
          <View style={styles.popup}>
            <View style={[styles.popupIcon, { backgroundColor: getCatColor(seleccionado.category) + '33' }]}>
              <Text style={{ fontSize: 24 }}>{getCatEmoji(seleccionado.category)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.popupName} numberOfLines={1}>{seleccionado.name}</Text>
              <Text style={styles.popupCat}>
                {seleccionado.tipo === 'evento' ? '🎟️ Evento' : seleccionado.category}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.popupBtn}
              onPress={() => router.push(seleccionado.tipo === 'evento'
                ? `/eventos/${seleccionado.id}` : `/lugares/${seleccionado.id}`)}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupClose} onPress={() => setSeleccionado(null)}>
              <Text style={{ color: T.fg3, fontSize: 14 }}>✕</Text>
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
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: S.md, paddingVertical: 6, borderRadius: R.full, backgroundColor: T.muted, borderWidth: 1, borderColor: T.border },
  chipEmoji:    { fontSize: 13 },
  chipText:     { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  count:        { fontSize: F.size.sm, color: T.fg3, marginLeft: S.xs, minWidth: 24 },
  mapContainer: { flex: 1, position: 'relative' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md },
  loadingText:  { fontSize: F.size.base, color: T.fg3 },
  popup:        {
    position: 'absolute', bottom: 24, left: S.lg, right: S.lg,
    backgroundColor: T.surface, borderRadius: 20, padding: S.lg,
    flexDirection: 'row', alignItems: 'center', gap: S.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 24, elevation: 12,
    borderWidth: 1, borderColor: T.border,
  },
  popupIcon:    { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  popupName:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  popupCat:     { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  popupBtn:     { width: 40, height: 40, borderRadius: R.full, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  popupClose:   { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
})

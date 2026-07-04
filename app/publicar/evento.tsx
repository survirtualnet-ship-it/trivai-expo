import { useState, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Calendar, MapPin, DollarSign, AlignLeft, CheckCircle, X } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, CATEGORIES, getCatEmoji } from '@/lib/tokens'
import { grantXP, XP } from '@/lib/xp'

type LugarResult = { id: string; name: string; category: string; address: string | null }

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function Campo({ label, value, onChangeText, placeholder, multiline = false, required = false, keyboardType = 'default' }: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder: string; multiline?: boolean; required?: boolean; keyboardType?: any
}) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={c.campo}>
      <Text style={c.campoLabel}>
        {label}{required && <Text style={{ color: T.orange }}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.fg4}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[c.campoInput, multiline && c.campoInputMulti, focused && c.campoInputFocused]}
      />
    </View>
  )
}

// Formatea texto DD/MM/AAAA mientras el usuario escribe
function formatFechaInput(raw: string) {
  const nums = raw.replace(/\D/g, '').slice(0, 8)
  if (nums.length <= 2) return nums
  if (nums.length <= 4) return `${nums.slice(0,2)}/${nums.slice(2)}`
  return `${nums.slice(0,2)}/${nums.slice(2,4)}/${nums.slice(4)}`
}

// Convierte DD/MM/AAAA → AAAA-MM-DD para Supabase
function toISODate(display: string): string | null {
  const parts = display.split('/')
  if (parts.length !== 3 || parts[2].length !== 4) return null
  const [d, m, y] = parts
  const date = new Date(`${y}-${m}-${d}`)
  if (isNaN(date.getTime())) return null
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
}

// Formatea HH:MM mientras el usuario escribe
function formatHoraInput(raw: string) {
  const nums = raw.replace(/\D/g, '').slice(0, 4)
  if (nums.length <= 2) return nums
  return `${nums.slice(0,2)}:${nums.slice(2)}`
}

export default function CrearEvento() {
  const hoy = new Date()
  const diaHoy = String(hoy.getDate()).padStart(2,'0')
  const mesHoy = String(hoy.getMonth()+1).padStart(2,'0')
  const anoHoy = String(hoy.getFullYear())

  const [nombre,      setNombre]      = useState('')
  const [categoria,   setCategoria]   = useState('')
  const [fecha,       setFecha]       = useState('')
  const [hora,        setHora]        = useState('')
  const [lugarQuery,      setLugarQuery]      = useState('')
  const [lugarResults,    setLugarResults]    = useState<LugarResult[]>([])
  const [lugarSelec,      setLugarSelec]      = useState<LugarResult | null>(null)
  const [buscandoLugar,   setBuscandoLugar]   = useState(false)
  const lugarTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [esGratis,    setEsGratis]    = useState(true)
  const [precio,      setPrecio]      = useState('')
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [exito,       setExito]       = useState(false)

  const onLugarChange = (text: string) => {
    setLugarQuery(text)
    setLugarSelec(null)
    if (lugarTimer.current) clearTimeout(lugarTimer.current)
    if (text.trim().length < 2) { setLugarResults([]); return }
    lugarTimer.current = setTimeout(async () => {
      setBuscandoLugar(true)
      const { data } = await supabase
        .from('places')
        .select('id, name, category, address')
        .ilike('name', '%' + text.trim() + '%')
        .limit(5)
      setLugarResults((data as LugarResult[]) ?? [])
      setBuscandoLugar(false)
    }, 300)
  }

  const seleccionarLugar = (lugar: LugarResult) => {
    setLugarSelec(lugar)
    setLugarQuery(lugar.name)
    setLugarResults([])
  }

  const limpiarLugar = () => {
    setLugarSelec(null)
    setLugarQuery('')
    setLugarResults([])
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError('El nombre del evento es obligatorio.'); return }
    if (!categoria)      { setError('Selecciona una categoría.'); return }
    if (!fecha.trim())   { setError('La fecha es obligatoria (DD/MM/AAAA).'); return }
    if (!hora.trim())    { setError('La hora es obligatoria (HH:MM).'); return }

    const isoDate = toISODate(fecha)
    if (!isoDate) { setError('La fecha no es válida. Usa el formato DD/MM/AAAA.'); return }

    const [hh, mm] = hora.split(':').map(Number)
    if (isNaN(hh) || isNaN(mm) || hh > 23 || mm > 59) {
      setError('La hora no es válida. Usa el formato HH:MM (ej: 20:00).'); return
    }

    setGuardando(true); setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setError('Debes iniciar sesión para publicar eventos.'); setGuardando(false); return }

    const startDatetime = new Date(`${isoDate}T${hora}:00`).toISOString()

    // Texto libre de lugar solo si no hay place_id vinculado
    const lugarTexto = !lugarSelec && lugarQuery.trim() ? lugarQuery.trim() : null
    const descFinal = [
      lugarTexto ? `📍 ${lugarTexto}` : null,
      descripcion.trim() || null,
    ].filter(Boolean).join('\n\n') || null

    const { error: err } = await supabase.from('events').insert({
      name:            nombre.trim(),
      category:        categoria,
      start_datetime:  startDatetime,
      description:     descFinal,
      place_id:        lugarSelec?.id ?? null,
      is_free:         esGratis,
      price:           esGratis ? 0 : Number(precio) || 0,
      is_featured:     false,
      is_active:       true,
      attendees_count: 0,
      photos:          [],
    })

    setGuardando(false)
    if (err) { setError(`Error al publicar: ${err.message}`); return }
    grantXP(session.user.id, XP.evento)
    setExito(true)
    setTimeout(() => router.replace('/eventos'), 2000)
  }

  if (exito) {
    return (
      <View style={c.exitoContainer}>
        <CheckCircle size={64} color={T.green} strokeWidth={1.5} />
        <Text style={c.exitoTitle}>¡Evento publicado!</Text>
        <Text style={c.exitoSub}>Ya aparece en el listado de eventos</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={c.root} edges={['top']}>
      <View style={c.header}>
        <TouchableOpacity style={c.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={c.title}>Publicar un evento</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: S.lg, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">

          <Campo
            label="Nombre del evento"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Festival de Jazz, Feria artesanal..."
            required
          />

          {/* Categoría */}
          <View style={c.campo}>
            <Text style={c.campoLabel}>Categoría <Text style={{ color: T.orange }}>*</Text></Text>
            <View style={c.chips}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[c.chip, categoria === cat && c.chipActive]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text style={[c.chipText, categoria === cat && c.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fecha y hora */}
          <View style={c.campo}>
            <View style={c.campoLabelRow}>
              <Calendar size={14} color={T.fg3} />
              <Text style={c.campoLabel}>Fecha y hora <Text style={{ color: T.orange }}>*</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', gap: S.sm }}>
              <View style={{ flex: 2 }}>
                <TextInput
                  value={fecha}
                  onChangeText={v => setFecha(formatFechaInput(v))}
                  placeholder={`${diaHoy}/${mesHoy}/${anoHoy}`}
                  placeholderTextColor={T.fg4}
                  keyboardType="number-pad"
                  maxLength={10}
                  style={c.campoInput}
                />
                <Text style={c.campoHint}>DD/MM/AAAA</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={hora}
                  onChangeText={v => setHora(formatHoraInput(v))}
                  placeholder="20:00"
                  placeholderTextColor={T.fg4}
                  keyboardType="number-pad"
                  maxLength={5}
                  style={c.campoInput}
                />
                <Text style={c.campoHint}>HH:MM</Text>
              </View>
            </View>
          </View>

          {/* Lugar */}
          <View style={c.campo}>
            <View style={c.campoLabelRow}>
              <MapPin size={14} color={T.fg3} />
              <Text style={c.campoLabel}>Lugar del evento</Text>
            </View>
            {lugarSelec ? (
              <View style={c.lugarSelecBox}>
                <Text style={{ fontSize: 22, marginRight: S.sm }}>{getCatEmoji(lugarSelec.category)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={c.lugarSelecNombre}>{lugarSelec.name}</Text>
                  {lugarSelec.address ? <Text style={c.lugarSelecAddr} numberOfLines={1}>{lugarSelec.address}</Text> : null}
                </View>
                <TouchableOpacity onPress={limpiarLugar} style={{ padding: 4 }}>
                  <X size={16} color={T.fg3} />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TextInput
                  value={lugarQuery}
                  onChangeText={onLugarChange}
                  placeholder="Buscar lugar en Trivai... (opcional)"
                  placeholderTextColor={T.fg4}
                  style={c.campoInput}
                />
                {buscandoLugar && <ActivityIndicator size="small" color={T.purple} style={{ marginTop: 4 }} />}
                {lugarResults.length > 0 && (
                  <View style={c.lugarDropdown}>
                    {lugarResults.map(r => (
                      <TouchableOpacity key={r.id} style={c.lugarDropdownRow} onPress={() => seleccionarLugar(r)}>
                        <Text style={{ fontSize: 18, marginRight: S.sm }}>{getCatEmoji(r.category)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={c.lugarDropNombre} numberOfLines={1}>{r.name}</Text>
                          {r.address ? <Text style={c.lugarDropAddr} numberOfLines={1}>{r.address}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Descripción */}
          <View style={c.campo}>
            <View style={c.campoLabelRow}>
              <AlignLeft size={14} color={T.fg3} />
              <Text style={c.campoLabel}>Descripción</Text>
            </View>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el evento: artistas, actividades, qué incluye..."
              placeholderTextColor={T.fg4}
              multiline
              numberOfLines={4}
              style={[c.campoInput, c.campoInputMulti]}
            />
          </View>

          {/* Precio */}
          <View style={c.campo}>
            <View style={c.campoLabelRow}>
              <DollarSign size={14} color={T.fg3} />
              <Text style={c.campoLabel}>Precio</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: S.sm, marginBottom: esGratis ? 0 : S.sm }}>
              <TouchableOpacity
                style={[c.precioBtn, esGratis && c.precioBtnGratis]}
                onPress={() => setEsGratis(true)}
              >
                <Text style={[c.precioBtnText, esGratis && { color: '#fff' }]}>Gratis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[c.precioBtn, !esGratis && c.precioBtnCosto]}
                onPress={() => setEsGratis(false)}
              >
                <Text style={[c.precioBtnText, !esGratis && { color: '#fff' }]}>Con costo</Text>
              </TouchableOpacity>
            </View>
            {!esGratis && (
              <TextInput
                value={precio}
                onChangeText={setPrecio}
                placeholder="Precio en Bolivianos (Bs.)"
                placeholderTextColor={T.fg4}
                keyboardType="numeric"
                style={[c.campoInput, { marginTop: S.sm }]}
              />
            )}
          </View>

          {error && (
            <View style={c.errorBox}>
              <Text style={c.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[c.submitBtn, guardando && c.submitBtnDisabled]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando
              ? <ActivityIndicator color="#fff" />
              : <Text style={c.submitBtnText}>Publicar evento</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const c = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:              { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:             { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  campo:             { marginBottom: S.lg },
  campoLabelRow:     { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.sm },
  campoLabel:        { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: S.sm },
  campoInput:        { backgroundColor: T.muted, borderWidth: 1.5, borderColor: T.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm + 2, fontSize: F.size.md, color: T.fg1 },
  campoInputMulti:   { height: 100, textAlignVertical: 'top', paddingTop: S.sm },
  campoInputFocused: { borderColor: T.purple },
  campoHint:         { fontSize: F.size.xs, color: T.fg4, marginTop: 4 },
  chips:             { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip:              { paddingHorizontal: S.md, paddingVertical: S.xs + 2, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  chipActive:        { backgroundColor: T.orange, borderColor: T.orange },
  chipText:          { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  chipTextActive:    { color: '#fff' },
  precioBtn:         { flex: 1, height: 44, borderRadius: R.full, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border },
  precioBtnGratis:   { backgroundColor: T.green, borderColor: T.green },
  precioBtnCosto:    { backgroundColor: T.orange, borderColor: T.orange },
  precioBtnText:     { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg2 },
  errorBox:          { backgroundColor: T.dangerSoft, borderRadius: R.md, padding: S.md, marginBottom: S.md },
  errorText:         { fontSize: F.size.sm, color: T.danger },
  submitBtn:         { height: 52, borderRadius: R.full, backgroundColor: T.orange, alignItems: 'center', justifyContent: 'center', marginTop: S.sm },
  submitBtnDisabled: { backgroundColor: T.fg4 },
  submitBtnText:     { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  exitoContainer:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg, gap: S.md },
  exitoTitle:        { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.fg1 },
  exitoSub:          { fontSize: F.size.md, color: T.fg2 },
  lugarSelecBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: T.purpleSoft, borderRadius: R.md, padding: S.md, borderWidth: 1.5, borderColor: T.purple },
  lugarSelecNombre:  { fontSize: F.size.sm, fontWeight: F.weight.bold, color: T.fg1 },
  lugarSelecAddr:    { fontSize: F.size.xs, color: T.fg3, marginTop: 2 },
  lugarDropdown:     { backgroundColor: T.surface, borderRadius: R.md, borderWidth: 1, borderColor: T.border, marginTop: 4, overflow: 'hidden' },
  lugarDropdownRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: S.md, paddingVertical: S.sm + 2, borderBottomWidth: 1, borderBottomColor: T.border },
  lugarDropNombre:   { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1 },
  lugarDropAddr:     { fontSize: F.size.xs, color: T.fg3, marginTop: 1 },
})

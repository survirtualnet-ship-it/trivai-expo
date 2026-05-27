import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Calendar, MapPin, DollarSign, AlignLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'

const CATEGORIAS = [
  'Música', 'Arte', 'Gastronomía', 'Deportes',
  'Entretenimiento', 'Cultura', 'Naturaleza', 'Social',
]

function Campo({
  label, value, onChangeText, placeholder, multiline = false, required = false, keyboardType = 'default',
}: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder: string; multiline?: boolean; required?: boolean; keyboardType?: any
}) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={c.campo}>
      {label ? (
        <Text style={c.campoLabel}>
          {label}{required && <Text style={{ color: T.orange }}> *</Text>}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.fg4}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[c.campoInput, multiline && c.campoInputMulti, focused && c.campoInputFocused]}
      />
    </View>
  )
}

export default function CrearEvento() {
  const [nombre,      setNombre]      = useState('')
  const [categoria,   setCategoria]   = useState('')
  const [fecha,       setFecha]       = useState('')
  const [hora,        setHora]        = useState('')
  const [lugar,       setLugar]       = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [esGratis,    setEsGratis]    = useState(true)
  const [precio,      setPrecio]      = useState('')
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [exito,       setExito]       = useState(false)

  const handleGuardar = async () => {
    if (!nombre.trim() || !categoria || !fecha.trim() || !hora.trim()) {
      setError('Completa los campos obligatorios: nombre, categoría, fecha y hora.')
      return
    }
    setGuardando(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Debes iniciar sesión.'); setGuardando(false); return }

    const startDatetime = new Date(`${fecha}T${hora}:00`).toISOString()

    const { error: err } = await supabase.from('events').insert({
      name:            nombre.trim(),
      category:        categoria,
      start_datetime:  startDatetime,
      description:     descripcion.trim() || null,
      location:        lugar.trim() || 'Santa Cruz',
      is_free:         esGratis,
      price:           esGratis ? 0 : Number(precio) || 0,
      is_featured:     false,
      is_active:       true,
      attendees_count: 0,
      photos:          [],
    })

    setGuardando(false)
    if (err) { setError(`Error: ${err.message}`); return }
    setExito(true)
    setTimeout(() => router.replace('/eventos'), 1500)
  }

  if (exito) {
    return (
      <View style={c.exitoContainer}>
        <View style={c.exitoIcon}><Text style={{ fontSize: 32 }}>✓</Text></View>
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
        <ScrollView contentContainerStyle={{ padding: S.lg }} keyboardShouldPersistTaps="handled">

          <Campo label="Nombre del evento" value={nombre} onChangeText={setNombre} placeholder="Ej: Festival de Jazz" required />

          {/* Categoría */}
          <View style={c.campo}>
            <Text style={c.campoLabel}>Categoría <Text style={{ color: T.orange }}>*</Text></Text>
            <View style={c.chips}>
              {CATEGORIAS.map(cat => (
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
              <TextInput
                value={fecha}
                onChangeText={setFecha}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={T.fg4}
                style={[c.campoInput, { flex: 2 }]}
              />
              <TextInput
                value={hora}
                onChangeText={setHora}
                placeholder="HH:MM"
                placeholderTextColor={T.fg4}
                style={[c.campoInput, { flex: 1 }]}
              />
            </View>
          </View>

          {/* Lugar */}
          <View style={c.campo}>
            <View style={c.campoLabelRow}>
              <MapPin size={14} color={T.fg3} />
              <Text style={c.campoLabel}>Lugar del evento</Text>
            </View>
            <TextInput
              value={lugar}
              onChangeText={setLugar}
              placeholder="Ej: Teatro Municipal, Parque El Arenal"
              placeholderTextColor={T.fg4}
              style={c.campoInput}
            />
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
              placeholder="Describe el evento, artistas, actividades..."
              placeholderTextColor={T.fg4}
              multiline
              numberOfLines={3}
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
                placeholder="Precio en Bs."
                placeholderTextColor={T.fg4}
                keyboardType="numeric"
                style={c.campoInput}
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
  campoInputMulti:   { height: 88, textAlignVertical: 'top', paddingTop: S.sm },
  campoInputFocused: { borderColor: T.purple },
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
  submitBtn:         { height: 52, borderRadius: R.full, backgroundColor: T.orange, alignItems: 'center', justifyContent: 'center', marginBottom: S.lg },
  submitBtnDisabled: { backgroundColor: T.fg4 },
  submitBtnText:     { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  exitoContainer:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg, gap: S.md },
  exitoIcon:         { width: 72, height: 72, borderRadius: 36, backgroundColor: T.greenSoft, alignItems: 'center', justifyContent: 'center' },
  exitoTitle:        { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.fg1 },
  exitoSub:          { fontSize: F.size.md, color: T.fg2 },
})

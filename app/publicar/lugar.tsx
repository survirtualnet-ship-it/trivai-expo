import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, MapPin, Phone, Globe, AlignLeft, Clock, Navigation } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { T, F, S, R, CATEGORIES } from '@/lib/tokens'
import { grantXP, XP } from '@/lib/xp'
import { getCurrentCoords, resolvePlaceCoords, type Coords } from '@/lib/geolocation'

const CIUDADES = ['Santa Cruz', 'La Paz', 'Cochabamba', 'Sucre', 'Oruro', 'Potosí']

function Campo({
  label, value, onChangeText, placeholder, multiline = false, required = false, keyboardType = 'default', icon,
}: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder: string; multiline?: boolean; required?: boolean; keyboardType?: any; icon?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={c.campo}>
      {label ? (
        <View style={c.campoLabelRow}>
          {icon}
          <Text style={c.campoLabel}>
            {label}{required && <Text style={{ color: T.orange }}> *</Text>}
          </Text>
        </View>
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

export default function CrearLugar() {
  const [nombre,      setNombre]      = useState('')
  const [categoria,   setCategoria]   = useState('')
  const [direccion,   setDireccion]   = useState('')
  const [ciudad,      setCiudad]      = useState('Santa Cruz')
  const [descripcion, setDescripcion] = useState('')
  const [horario,     setHorario]     = useState('')
  const [telefono,    setTelefono]    = useState('')
  const [website,     setWebsite]     = useState('')
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [exito,       setExito]       = useState(false)
  const [coords,      setCoords]      = useState<Coords | null>(null)
  const [locLoading,  setLocLoading]  = useState(false)

  const usarMiUbicacion = async () => {
    setLocLoading(true)
    const p = await getCurrentCoords()
    setLocLoading(false)
    if (p) setCoords(p)
    else setError('No se pudo obtener tu ubicación. Revisa los permisos.')
  }

  const handleGuardar = async () => {
    if (!nombre.trim() || !categoria || !direccion.trim()) {
      setError('Completa los campos obligatorios: nombre, categoría y dirección.')
      return
    }
    setGuardando(true); setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    if (!user) { setError('Debes iniciar sesión.'); setGuardando(false); return }

    const resolved = await resolvePlaceCoords(direccion, ciudad, coords)

    const { error: err } = await supabase.from('places').insert({
      name:         nombre.trim(),
      category:     categoria,
      address:      direccion.trim(),
      city:         ciudad,
      description:  descripcion.trim() || null,
      hours:        horario.trim() ? { horario: horario.trim() } : null,
      phone:        telefono.trim() || null,
      website:      website.trim() || null,
      photos:       [],
      rating_avg:   0,
      rating_count: 0,
      is_open:      true,
      is_sponsored: false,
      is_verified:  false,
      latitude:     resolved?.lat ?? null,
      longitude:    resolved?.lng ?? null,
    })

    setGuardando(false)
    if (err) { setError(`Error: ${err.message}`); return }
    grantXP(user.id, XP.lugar)
    setExito(true)
    setTimeout(() => router.replace('/lugares'), 1500)
  }

  if (exito) {
    return (
      <View style={c.exitoContainer}>
        <View style={c.exitoIcon}><Text style={{ fontSize: 32 }}>✓</Text></View>
        <Text style={c.exitoTitle}>¡Lugar publicado!</Text>
        <Text style={c.exitoSub}>Ya aparece en Trivai</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={c.root} edges={['top']}>
      <View style={c.header}>
        <TouchableOpacity style={c.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={c.title}>Agregar un lugar</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: S.lg }} keyboardShouldPersistTaps="handled">

          <Campo
            label="Nombre del lugar" value={nombre} onChangeText={setNombre}
            placeholder="Ej: Café del Centro" required
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

          <Campo
            label="Dirección" value={direccion} onChangeText={v => { setDireccion(v); setCoords(null) }}
            placeholder="Ej: Av. Monseñor Rivero 234, Equipetrol" required
            icon={<MapPin size={14} color={T.fg3} />}
          />

          <TouchableOpacity style={c.locBtn} onPress={usarMiUbicacion} disabled={locLoading}>
            {locLoading
              ? <ActivityIndicator color={T.purple} size="small" />
              : <Navigation size={16} color={T.purple} />
            }
            <Text style={c.locBtnText}>
              {coords ? '✓ Ubicación GPS seleccionada' : 'Usar mi ubicación actual'}
            </Text>
          </TouchableOpacity>
          {!coords && (
            <Text style={c.locHint}>
              Si no usas GPS, intentaremos ubicar el lugar por la dirección al publicar.
            </Text>
          )}

          {/* Ciudad */}
          <View style={c.campo}>
            <Text style={c.campoLabel}>Ciudad</Text>
            <View style={c.chips}>
              {CIUDADES.map(cid => (
                <TouchableOpacity
                  key={cid}
                  style={[c.chip, ciudad === cid && c.chipActivePurple]}
                  onPress={() => setCiudad(cid)}
                >
                  <Text style={[c.chipText, ciudad === cid && c.chipTextActive]}>{cid}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Campo
            label="Descripción" value={descripcion} onChangeText={setDescripcion}
            placeholder="Describe el lugar, ambiente, especialidades..." multiline
            icon={<AlignLeft size={14} color={T.fg3} />}
          />

          <Campo
            label="Horario" value={horario} onChangeText={setHorario}
            placeholder="Ej: Lun-Vie 8:00-22:00 · Sáb-Dom 9:00-23:00"
            icon={<Clock size={14} color={T.fg3} />}
          />

          <View style={{ flexDirection: 'row', gap: S.md }}>
            <View style={{ flex: 1 }}>
              <Campo
                label="Teléfono" value={telefono} onChangeText={setTelefono}
                placeholder="+591 ..." keyboardType="phone-pad"
                icon={<Phone size={14} color={T.fg3} />}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Campo
                label="Sitio web" value={website} onChangeText={setWebsite}
                placeholder="https://..." keyboardType="url"
                icon={<Globe size={14} color={T.fg3} />}
              />
            </View>
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
              : <Text style={c.submitBtnText}>Publicar lugar</Text>
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
  chipActivePurple:  { backgroundColor: T.purple, borderColor: T.purple },
  chipText:          { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  chipTextActive:    { color: '#fff' },
  locBtn:            { flexDirection: 'row', alignItems: 'center', gap: S.sm, alignSelf: 'flex-start', paddingVertical: S.sm, paddingHorizontal: S.md, borderRadius: R.full, backgroundColor: T.purpleSoft, marginBottom: S.sm, marginTop: -S.sm },
  locBtnText:        { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.purple },
  locHint:           { fontSize: F.size.xs, color: T.fg3, marginBottom: S.lg, lineHeight: 18 },
  errorBox:          { backgroundColor: T.dangerSoft, borderRadius: R.md, padding: S.md, marginBottom: S.md },
  errorText:         { fontSize: F.size.sm, color: T.danger },
  submitBtn:         { height: 52, borderRadius: R.full, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', marginBottom: S.lg },
  submitBtnDisabled: { backgroundColor: T.fg4 },
  submitBtnText:     { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  exitoContainer:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: T.bg, gap: S.md },
  exitoIcon:         { width: 72, height: 72, borderRadius: 36, backgroundColor: T.greenSoft, alignItems: 'center', justifyContent: 'center' },
  exitoTitle:        { fontSize: F.size.xxl, fontWeight: F.weight.bold, color: T.fg1 },
  exitoSub:          { fontSize: F.size.md, color: T.fg2 },
})

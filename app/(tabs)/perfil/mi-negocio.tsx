import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, Phone, Globe, AlignLeft, ShieldCheck, ShieldAlert, Camera } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R, CATEGORIES } from '@/lib/tokens'

export default function MiNegocio() {
  const { profile, refreshProfile } = useUser()

  const [nombre,      setNombre]      = useState('')
  const [categoria,   setCategoria]   = useState('')
  const [direccion,   setDireccion]   = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [telefono,    setTelefono]    = useState('')
  const [website,     setWebsite]     = useState('')
  const [placeUUID,   setPlaceUUID]   = useState<string | null>(null)
  const [isVerified,  setIsVerified]  = useState(false)
  const [guardando,   setGuardando]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [exito,       setExito]       = useState(false)

  useEffect(() => {
    if (!profile) return
    if (profile.business_name)     setNombre(profile.business_name)
    if (profile.business_address)  setDireccion(profile.business_address ?? '')
    if (profile.business_phone)    setTelefono(profile.business_phone ?? '')
    if (profile.business_website)  setWebsite(profile.business_website ?? '')
    if (profile.business_category) setCategoria(profile.business_category ?? '')

    async function cargarLugar() {
      if (!profile?.business_name) return
      const { data } = await supabase
        .from('places')
        .select('id, description, category, phone, website, is_verified')
        .eq('name', profile.business_name!)
        .maybeSingle()
      if (data) {
        setPlaceUUID(data.id)
        if (data.description) setDescripcion(data.description)
        if (data.category)    setCategoria(data.category)
        if (data.phone)       setTelefono(data.phone)
        if (data.website)     setWebsite(data.website)
        setIsVerified(!!data.is_verified)
      }
    }
    cargarLugar()
  }, [profile])

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError('El nombre del negocio es obligatorio.'); return }
    setGuardando(true); setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    if (!user) { setError('Debes iniciar sesión.'); setGuardando(false); return }

    const payload = {
      name:         nombre.trim(),
      category:     categoria || null,
      description:  descripcion.trim() || null,
      phone:        telefono.trim() || null,
      website:      website.trim() || null,
      address:      direccion.trim() || null,
      city:         'Santa Cruz',
      is_open:      true,
      is_sponsored: false,
      is_verified:  isVerified,
      latitude:     profile?.business_lat ?? null,
      longitude:    profile?.business_lng ?? null,
    }

    let err: any = null
    if (placeUUID) {
      const res = await supabase.from('places').update(payload).eq('id', placeUUID)
      err = res.error
    } else {
      const res = await supabase.from('places').insert({ ...payload, rating_avg: 0, rating_count: 0, photos: [] }).select('id').single()
      err = res.error
      if (res.data) setPlaceUUID(res.data.id)
    }

    await supabase.from('profiles').update({
      account_type:      'business',
      business_name:     nombre.trim(),
      business_address:  direccion.trim() || null,
      business_phone:    telefono.trim() || null,
      business_website:  website.trim() || null,
      business_category: categoria || null,
    }).eq('id', user.id)

    setGuardando(false)
    if (err) { setError(`Error: ${err.message}`); return }
    setExito(true)
    refreshProfile?.()
    setTimeout(() => router.back(), 1500)
  }

  if (exito) {
    return (
      <View style={c.exitoContainer}>
        <View style={c.exitoIcon}><Text style={{ fontSize: 32 }}>✓</Text></View>
        <Text style={c.exitoTitle}>¡Negocio actualizado!</Text>
        <Text style={c.exitoSub}>Los cambios ya están visibles en Trivai</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={c.root} edges={['top']}>
      <View style={c.header}>
        <TouchableOpacity style={c.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={c.title}>Mi negocio</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: S.lg }} keyboardShouldPersistTaps="handled">

          {/* Info nombre/dirección actual */}
          <View style={c.infoBanner}>
            <Text style={c.infoNombre}>🔒 {nombre || 'Sin negocio vinculado'}</Text>
            {direccion ? <Text style={c.infoDireccion}>{direccion}</Text> : null}
          </View>

          {/* Estado verificación */}
          {isVerified ? (
            <View style={c.verifiedBanner}>
              <ShieldCheck size={22} color={T.green} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={c.verifiedTitle}>Negocio verificado ✅</Text>
                <Text style={c.verifiedSub}>Tu negocio aparece como verificado en Trivai</Text>
              </View>
            </View>
          ) : placeUUID ? (
            <View style={c.pendienteBanner}>
              <ShieldAlert size={22} color={T.orange} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={c.pendienteTitle}>Pendiente de verificación</Text>
                <Text style={c.pendienteSub}>Contacta al equipo de Trivai para verificar tu negocio</Text>
              </View>
            </View>
          ) : null}

          {/* Nombre */}
          <Campo label="Nombre del negocio" value={nombre} onChangeText={setNombre} placeholder="Nombre de tu negocio" required />

          {/* Categoría */}
          <View style={c.campo}>
            <Text style={c.campoLabel}>Categoría</Text>
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
            label="Descripción" value={descripcion} onChangeText={setDescripcion}
            placeholder="Describe tu negocio, especialidades, ambiente..." multiline
            icon={<AlignLeft size={14} color={T.fg3} />}
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
              : <Text style={c.submitBtnText}>Guardar cambios</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

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

const c = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:              { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:             { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  infoBanner:        { backgroundColor: T.muted, borderRadius: R.md, padding: S.md, marginBottom: S.lg },
  infoNombre:        { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.fg1 },
  infoDireccion:     { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  verifiedBanner:    { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.greenSoft, borderRadius: R.md, padding: S.md, marginBottom: S.lg },
  verifiedTitle:     { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.greenInk },
  verifiedSub:       { fontSize: F.size.xs, color: T.greenInk, opacity: 0.8, marginTop: 2 },
  pendienteBanner:   { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.orangeSoft, borderRadius: R.md, padding: S.md, marginBottom: S.lg },
  pendienteTitle:    { fontSize: F.size.md, fontWeight: F.weight.bold, color: T.orangeInk },
  pendienteSub:      { fontSize: F.size.xs, color: T.orangeInk, opacity: 0.8, marginTop: 2 },
  campo:             { marginBottom: S.lg },
  campoLabelRow:     { flexDirection: 'row', alignItems: 'center', gap: S.xs, marginBottom: S.sm },
  campoLabel:        { fontSize: F.size.xs, fontWeight: F.weight.bold, color: T.fg2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: S.sm },
  campoInput:        { backgroundColor: T.muted, borderWidth: 1.5, borderColor: T.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: S.sm + 2, fontSize: F.size.md, color: T.fg1 },
  campoInputMulti:   { height: 88, textAlignVertical: 'top', paddingTop: S.sm },
  campoInputFocused: { borderColor: T.purple },
  chips:             { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip:              { paddingHorizontal: S.md, paddingVertical: S.xs + 2, borderRadius: R.full, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  chipActive:        { backgroundColor: T.purple, borderColor: T.purple },
  chipText:          { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg2 },
  chipTextActive:    { color: '#fff' },
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

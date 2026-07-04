import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { supabase } from '@/lib/supabase'
import { T, F, S, R } from '@/lib/tokens'

const PAISES = [
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+55',  flag: '🇧🇷', name: 'Brasil' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+51',  flag: '🇵🇪', name: 'Perú' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canadá' },
  { code: '+34',  flag: '🇪🇸', name: 'España' },
]

function passwordStrength(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { label: 'Débil', color: T.danger }
  if (score === 2) return { label: 'Regular', color: T.warning }
  if (score === 3) return { label: 'Buena', color: T.orange }
  return { label: 'Fuerte', color: T.green }
}

export default function Registro() {
  const [step, setStep] = useState<1 | 2>(1)

  // Paso 1
  const [fullName,    setFullName]    = useState('')
  const [username,    setUsername]    = useState('')
  const [paisCode,    setPaisCode]    = useState('+591')
  const [phone,       setPhone]       = useState('')
  const [showPaises,  setShowPaises]  = useState(false)

  // Paso 2
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const paisActual = PAISES.find(p => p.code === paisCode)!
  const strength   = passwordStrength(password)

  const handlePaso1 = async () => {
    if (!fullName.trim()) { setError('Ingresa tu nombre completo'); return }
    if (!username.trim()) { setError('Ingresa un nombre de usuario'); return }
    if (username.includes(' ')) { setError('El usuario no puede tener espacios'); return }
    if (!phone.trim() || phone.length < 7) { setError('Número de teléfono inválido'); return }

    setLoading(true); setError('')

    const { data: existing } = await supabase.from('profiles')
      .select('id').eq('username', username.toLowerCase()).single()
    if (existing) { setError('Ese nombre de usuario ya está en uso'); setLoading(false); return }

    setLoading(false)
    setStep(2)
  }

  const handleRegistro = async () => {
    if (!email.trim()) { setError('Ingresa tu email'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true); setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: fullName,
          username:  username.toLowerCase(),
          phone:     `${paisCode}${phone.replace(/\s/g, '')}`,
        },
      },
    })

    if (err) { setError(err.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id:         data.user.id,
        full_name:  fullName,
        username:   username.toLowerCase(),
        city:       'Santa Cruz',
        bio:        '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }

    setLoading(false)
    router.replace('/')
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* MODAL SELECTOR DE PAÍS */}
      <Modal visible={showPaises} transparent animationType="slide"
        onRequestClose={() => setShowPaises(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPaises(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Seleccionar país</Text>
            <FlatList
              data={PAISES}
              keyExtractor={i => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.paisRow}
                  onPress={() => { setPaisCode(item.code); setShowPaises(false) }}>
                  <Text style={styles.paisFlag}>{item.flag}</Text>
                  <Text style={styles.paisName}>{item.name}</Text>
                  <Text style={styles.paisCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* HEADER */}
        <ScreenHeader
          title="Crear cuenta"
          onBack={() => step === 2 ? setStep(1) : router.back()}
          right={<Text style={styles.stepLabel}>Paso {step} de 2</Text>}
        />

        <View style={styles.content}>
          <Text style={styles.title}>{step === 1 ? 'Crea tu cuenta' : 'Tu acceso'}</Text>
          <Text style={styles.sub}>{step === 1 ? 'Cuéntanos cómo te llamas' : 'Elige tu email y contraseña'}</Text>

          {/* PROGRESO */}
          <View style={styles.progress}>
            <View style={[styles.progressBar, { flex: 1, backgroundColor: T.purple }]} />
            <View style={[styles.progressBar, { flex: 1, backgroundColor: step === 2 ? T.purple : T.border }]} />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName}
                  placeholder="Juan Pérez" placeholderTextColor={T.fg4} autoCapitalize="words" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Nombre de usuario</Text>
                <TextInput style={styles.input} value={username}
                  onChangeText={t => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="juanperez" placeholderTextColor={T.fg4} autoCapitalize="none" autoCorrect={false} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.phoneRow}>
                  <TouchableOpacity style={styles.paisBtn} onPress={() => setShowPaises(true)}>
                    <Text style={styles.paisFlag}>{paisActual.flag}</Text>
                    <Text style={styles.paisBtnCode}>{paisActual.code}</Text>
                    <ChevronDown size={14} color={T.fg3} />
                  </TouchableOpacity>
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={phone} onChangeText={setPhone}
                    placeholder="71234567" placeholderTextColor={T.fg4}
                    keyboardType="phone-pad" />
                </View>
              </View>

              <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handlePaso1} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Continuar →</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail}
                  placeholder="tu@email.com" placeholderTextColor={T.fg4}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.passRow}>
                  <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    value={password} onChangeText={setPassword}
                    placeholder="Mínimo 6 caracteres" placeholderTextColor={T.fg4}
                    secureTextEntry={!showPass} />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                    {showPass ? <EyeOff size={20} color={T.fg3} /> : <Eye size={20} color={T.fg3} />}
                  </TouchableOpacity>
                </View>
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[0, 1, 2, 3].map(i => (
                      <View key={i} style={[styles.strengthSeg,
                        { backgroundColor: i < passwordStrength(password).label.length / 2
                          ? strength.color : T.border }]} />
                    ))}
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]}
                onPress={handleRegistro} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Crear cuenta</Text>
                }
              </TouchableOpacity>
            </>
          )}

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  scroll:        { flexGrow: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerLogo:    { flex: 1, fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.purple },
  stepLabel:     { fontSize: F.size.sm, color: T.fg3, fontWeight: F.weight.medium },
  content:       { padding: S.xl },
  title:         { fontSize: 26, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.sm },
  sub:           { fontSize: F.size.base, color: T.fg3, marginBottom: S.lg },
  progress:      { flexDirection: 'row', gap: S.sm, marginBottom: S.xl, height: 4 },
  progressBar:   { height: 4, borderRadius: R.full },
  errorBox:      { backgroundColor: T.orangeSoft, borderWidth: 1, borderColor: T.orange, borderRadius: R.md, padding: S.md, marginBottom: S.lg },
  errorText:     { fontSize: F.size.sm, color: T.orange, fontWeight: F.weight.medium },
  field:         { marginBottom: S.lg },
  label:         { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1, marginBottom: S.sm },
  input:         { height: 52, borderRadius: R.md, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.surface, paddingHorizontal: S.lg, fontSize: F.size.md, color: T.fg1 },
  phoneRow:      { flexDirection: 'row', gap: S.sm, alignItems: 'center' },
  paisBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, height: 52, paddingHorizontal: S.md, borderRadius: R.md, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.surface },
  paisFlag:      { fontSize: 20 },
  paisBtnCode:   { fontSize: F.size.base, color: T.fg1, fontWeight: F.weight.medium },
  passRow:       { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  eyeBtn:        { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  strengthRow:   { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginTop: S.sm },
  strengthSeg:   { flex: 1, height: 4, borderRadius: R.full },
  strengthLabel: { fontSize: F.size.sm, fontWeight: F.weight.semibold, width: 50 },
  btnPrimary:    { height: 52, borderRadius: R.lg, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', shadowColor: T.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6, marginBottom: S.lg },
  btnDisabled:   { backgroundColor: T.fg4, shadowOpacity: 0, elevation: 0 },
  btnText:       { fontSize: F.size.lg, fontWeight: F.weight.bold, color: '#fff' },
  loginRow:      { flexDirection: 'row', justifyContent: 'center' },
  loginText:     { fontSize: F.size.base, color: T.fg3 },
  loginLink:     { fontSize: F.size.base, color: T.purple, fontWeight: F.weight.bold },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet:    { backgroundColor: T.surface, borderRadius: 24, padding: S.xl, maxHeight: '70%' },
  modalHandle:   { width: 40, height: 4, borderRadius: R.full, backgroundColor: T.border, alignSelf: 'center', marginBottom: S.lg },
  modalTitle:    { fontSize: F.size.lg, fontWeight: F.weight.bold, color: T.fg1, marginBottom: S.md },
  paisRow:       { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  paisName:      { flex: 1, fontSize: F.size.base, color: T.fg1 },
  paisCode:      { fontSize: F.size.base, color: T.fg3 },
})

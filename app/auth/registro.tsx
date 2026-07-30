import { useMemo, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { AtSign, ChevronDown, Lock, Mail, Phone, User } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { Card } from '@/components/ui/Card'
import { AppInput } from '@/components/ui/AppInput'
import { Button } from '@/components/ui/Button'
import { AuthBranding } from '@/components/auth/AuthBranding'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { supabase } from '@/lib/supabase'
import { ensureProfile } from '@/lib/auth/ensureProfile'
import { navigateAfterAuth } from '@/lib/navigateAfterAuth'
import { getAuthRedirectUrl } from '@/lib/auth/redirectUrl'
import { T, F, S, R } from '@/lib/tokens'
import { FONT } from '@/lib/typography'

const PAISES = [
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+1', flag: '🇺🇸', name: 'USA / Canadá' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
]

function passwordStrength(p: string) {
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { label: 'Débil', color: T.danger, bars: 1 }
  if (score === 2) return { label: 'Regular', color: T.warning, bars: 2 }
  if (score === 3) return { label: 'Buena', color: T.orange, bars: 3 }
  return { label: 'Fuerte', color: T.green, bars: 4 }
}

export default function Registro() {
  const [step, setStep] = useState<1 | 2>(1)

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [paisCode, setPaisCode] = useState('+591')
  const [phone, setPhone] = useState('')
  const [showPaises, setShowPaises] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const paisActual = PAISES.find(p => p.code === paisCode)!
  const strength = passwordStrength(password)

  const step1Valid = useMemo(
    () =>
      fullName.trim().length > 0 &&
      username.trim().length > 0 &&
      phone.trim().length >= 7,
    [fullName, username, phone],
  )

  const step2Valid = useMemo(
    () => email.trim().length > 0 && password.length >= 6,
    [email, password],
  )

  const handlePaso1 = async () => {
    if (!step1Valid) {
      setError('Completa todos los campos correctamente')
      return
    }
    if (username.includes(' ')) {
      setError('El usuario no puede tener espacios')
      return
    }

    setLoading(true)
    setError('')

    const { data: existing, error: checkErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle()
    if (checkErr) {
      setError('No se pudo verificar el usuario. Intenta de nuevo.')
      setLoading(false)
      return
    }
    if (existing) {
      setError('Ese nombre de usuario ya está en uso')
      setLoading(false)
      return
    }

    const fullPhone = `${paisCode}${phone.replace(/\s/g, '')}`
    const { data: phoneTaken, error: phoneErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', fullPhone)
      .maybeSingle()
    if (phoneErr) {
      setError('No se pudo verificar el teléfono. Intenta de nuevo.')
      setLoading(false)
      return
    }
    if (phoneTaken) {
      setError('Ese número de teléfono ya está registrado')
      setLoading(false)
      return
    }

    setLoading(false)
    setError('')
    setStep(2)
  }

  const handleRegistro = async () => {
    if (!step2Valid) {
      setError('Ingresa un email válido y una contraseña de al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl('auth/callback'),
        data: {
          full_name: fullName,
          username: username.toLowerCase(),
          phone: `${paisCode}${phone.replace(/\s/g, '')}`,
        },
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const fullPhone = `${paisCode}${phone.replace(/\s/g, '')}`
      await ensureProfile(data.user)
      await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username.toLowerCase(),
          phone: fullPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)
    }

    setLoading(false)

    if (!data.session) {
      Alert.alert(
        'Revisa tu correo',
        'Te enviamos un enlace para confirmar tu cuenta antes de iniciar sesión.',
        [{ text: 'Entendido', onPress: () => router.replace('/auth/login') }],
      )
      return
    }

    if (data.user) {
      const profile = await ensureProfile(data.user)
      await navigateAfterAuth(data.user, profile)
    }
  }

  return (
    <>
      <Modal
        visible={showPaises}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaises(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaises(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Seleccionar país</Text>
            <FlatList
              data={PAISES}
              keyExtractor={i => i.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.paisRow}
                  onPress={() => {
                    setPaisCode(item.code)
                    setShowPaises(false)
                  }}
                >
                  <Text style={styles.paisFlag}>{item.flag}</Text>
                  <Text style={styles.paisName}>{item.name}</Text>
                  <Text style={styles.paisCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ScreenContainer
        header={
          <ScreenHeader
            title=""
            onBack={() => (step === 2 ? setStep(1) : router.back())}
            right={<Text style={styles.stepLabel}>Paso {step} de 2</Text>}
          />
        }
      >
        <AuthBranding
          title={step === 1 ? 'Bienvenido a Trivai 👋' : 'Casi listo 🎉'}
          subtitle={
            step === 1
              ? 'Descubre lo mejor cerca de ti'
              : 'Elige tu email y contraseña'
          }
        />

        <Card style={styles.card}>
          <View style={styles.progress}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View
              style={[
                styles.progressBar,
                step === 2 ? styles.progressActive : styles.progressInactive,
              ]}
            />
          </View>

          <AuthErrorBanner message={error} />

          {step === 1 ? (
            <View style={styles.form}>
              <AppInput
                label="Nombre completo"
                icon={User}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Juan Pérez"
                autoCapitalize="words"
                textContentType="name"
              />

              <AppInput
                label="Nombre de usuario"
                icon={AtSign}
                value={username}
                onChangeText={t =>
                  setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                }
                placeholder="juanperez"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.phoneBlock}>
                <Text style={styles.phoneLabel}>Teléfono</Text>
                <View style={styles.phoneRow}>
                  <Pressable
                    style={styles.paisBtn}
                    onPress={() => setShowPaises(true)}
                  >
                    <Text style={styles.paisFlag}>{paisActual.flag}</Text>
                    <Text style={styles.paisBtnCode}>{paisActual.code}</Text>
                    <ChevronDown size={14} color={T.fg3} />
                  </Pressable>
                  <View style={styles.phoneInputWrap}>
                    <AppInput
                      icon={Phone}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="71234567"
                      keyboardType="phone-pad"
                      containerStyle={styles.phoneInput}
                    />
                  </View>
                </View>
              </View>

              <Button
                label="Continuar"
                onPress={handlePaso1}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!step1Valid}
                style={styles.primaryBtn}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <AppInput
                label="Email"
                icon={Mail}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />

              <AppInput
                label="Contraseña"
                icon={Lock}
                password
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                textContentType="newPassword"
              />

              {password.length > 0 ? (
                <View style={styles.strengthRow}>
                  {[0, 1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.strengthSeg,
                        {
                          backgroundColor:
                            i < strength.bars ? strength.color : T.border,
                        },
                      ]}
                    />
                  ))}
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              ) : null}

              <Button
                label="Crear cuenta"
                onPress={handleRegistro}
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!step2Valid}
                style={styles.primaryBtn}
              />
            </View>
          )}
        </Card>

        <AuthFooterLink
          prefix="¿Ya tienes cuenta?"
          linkLabel="Iniciar sesión"
          onPress={() => router.push('/auth/login')}
        />
      </ScreenContainer>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: S.lg,
  },
  form: {
    gap: S.lg,
  },
  stepLabel: {
    fontFamily: FONT.medium,
    fontSize: F.size.sm,
    color: T.fg3,
    fontWeight: F.weight.medium,
  },
  progress: {
    flexDirection: 'row',
    gap: S.sm,
    height: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: R.full,
  },
  progressActive: {
    backgroundColor: T.primary,
  },
  progressInactive: {
    backgroundColor: T.border,
  },
  phoneBlock: {
    gap: S.sm,
  },
  phoneLabel: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    color: T.fg1,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: S.sm,
    alignItems: 'flex-start',
  },
  paisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 52,
    paddingHorizontal: S.md,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: T.border,
    backgroundColor: T.surface,
    alignSelf: 'flex-end',
  },
  paisFlag: {
    fontSize: 20,
  },
  paisBtnCode: {
    fontFamily: FONT.medium,
    fontSize: F.size.base,
    color: T.fg1,
    fontWeight: F.weight.medium,
  },
  phoneInputWrap: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginTop: -S.sm,
  },
  strengthSeg: {
    flex: 1,
    height: 4,
    borderRadius: R.full,
  },
  strengthLabel: {
    fontFamily: FONT.semibold,
    fontSize: F.size.sm,
    fontWeight: F.weight.semibold,
    width: 52,
  },
  primaryBtn: {
    backgroundColor: T.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: T.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: T.surface,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    padding: S.xl,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: R.full,
    backgroundColor: T.border,
    alignSelf: 'center',
    marginBottom: S.lg,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: F.size.lg,
    fontWeight: F.weight.bold,
    color: T.fg1,
    marginBottom: S.md,
  },
  paisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  paisName: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: F.size.base,
    color: T.fg1,
  },
  paisCode: {
    fontFamily: FONT.regular,
    fontSize: F.size.base,
    color: T.fg3,
  },
})

import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'

export default function EditarPerfil() {
  const { profile, initials } = useUser()
  const [nombre,   setNombre]   = useState('')
  const [usuario,  setUsuario]  = useState('')
  const [bio,      setBio]      = useState('')
  const [ciudad,   setCiudad]   = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (profile) {
      setNombre(profile.full_name ?? '')
      setUsuario(profile.username ?? '')
      setBio(profile.bio ?? '')
      setCiudad(profile.city ?? '')
    }
  }, [profile])

  const guardar = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    const { error } = await supabase.from('profiles').update({
      full_name: nombre.trim(),
      username:  usuario.trim().toLowerCase().replace(/[^a-z0-9_.]/g, ''),
      bio:       bio.trim() || null,
      city:      ciudad.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    setGuardando(false)
    if (error) {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.')
    } else {
      router.back()
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar perfil</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={guardar} disabled={guardando}>
          {guardando
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Guardar</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg }} keyboardShouldPersistTaps="handled">
        {/* AVATAR */}
        <View style={styles.avatarArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.avatarHint}>Foto de perfil</Text>
        </View>

        {/* CAMPOS */}
        {[
          { label: 'Nombre completo', value: nombre, onChange: setNombre, placeholder: 'Tu nombre', autoCapitalize: 'words' as const },
          { label: 'Usuario', value: usuario, onChange: setUsuario, placeholder: 'tu_usuario', autoCapitalize: 'none' as const, hint: 'Solo letras, números, puntos y guiones bajos' },
          { label: 'Ciudad', value: ciudad, onChange: setCiudad, placeholder: 'Santa Cruz', autoCapitalize: 'words' as const },
        ].map(f => (
          <View key={f.label} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={f.value}
              onChangeText={f.onChange}
              placeholder={f.placeholder}
              placeholderTextColor={T.fg4}
              autoCapitalize={f.autoCapitalize}
              autoCorrect={false}
            />
            {f.hint && <Text style={styles.hint}>{f.hint}</Text>}
          </View>
        ))}

        {/* BIO */}
        <View style={styles.field}>
          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos sobre ti..."
            placeholderTextColor={T.fg4}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>{bio.length}/160 caracteres</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:       { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  saveBtn:     { paddingHorizontal: S.md, paddingVertical: 8, backgroundColor: T.purple, borderRadius: R.full, minWidth: 72, alignItems: 'center' },
  saveBtnText: { fontSize: F.size.sm, fontWeight: F.weight.bold, color: '#fff' },
  avatarArea:  { alignItems: 'center', paddingVertical: S.xl },
  avatar:      { width: 88, height: 88, borderRadius: 44, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', marginBottom: S.sm },
  avatarText:  { fontSize: 32, fontWeight: F.weight.bold, color: '#fff' },
  avatarHint:  { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  field:       { marginBottom: S.lg },
  label:       { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg1, marginBottom: S.sm },
  input:       { height: 52, borderRadius: R.md, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.surface, paddingHorizontal: S.lg, fontSize: F.size.md, color: T.fg1 },
  textArea:    { height: 100, paddingTop: S.md, paddingBottom: S.md },
  hint:        { fontSize: F.size.xs, color: T.fg3, marginTop: 4 },
})

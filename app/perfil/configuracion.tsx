import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ArrowLeft, User, Bell, Shield, Info, ChevronRight, LogOut } from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'
import { useState } from 'react'

export default function Configuracion() {
  const { signOut } = useUser()
  const [notifEventos, setNotifEventos] = useState(true)
  const [notifAmigos,  setNotifAmigos]  = useState(true)

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth') } },
    ])
  }

  const secciones = [
    {
      titulo: 'Cuenta',
      items: [
        { icon: User,  label: 'Editar perfil',  onPress: () => router.push('/perfil/editar') },
      ],
    },
    {
      titulo: 'Notificaciones',
      items: [
        { icon: Bell, label: 'Eventos cercanos', toggle: notifEventos, onToggle: setNotifEventos },
        { icon: Bell, label: 'Amigos',           toggle: notifAmigos,  onToggle: setNotifAmigos  },
      ],
    },
    {
      titulo: 'Acerca de',
      items: [
        { icon: Shield, label: 'Privacidad',          onPress: () => {} },
        { icon: Info,   label: 'Términos de uso',     onPress: () => {} },
        { icon: Info,   label: 'Versión 1.0.0',       onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={T.fg1} />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: S.lg, gap: S.lg }}>
        {secciones.map(sec => (
          <View key={sec.titulo}>
            <Text style={styles.secTitulo}>{sec.titulo}</Text>
            <View style={styles.secCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.itemRow, idx < sec.items.length - 1 && styles.itemBorder]}
                  onPress={item.onPress}
                  disabled={item.toggle !== undefined}
                >
                  <View style={styles.itemIcon}>
                    <item.icon size={18} color={T.purple} />
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.toggle !== undefined
                    ? <Switch value={item.toggle} onValueChange={item.onToggle} trackColor={{ true: T.purple }} thumbColor="#fff" />
                    : <ChevronRight size={18} color={T.fg4} />
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* CERRAR SESIÓN */}
        <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
          <LogOut size={18} color={T.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  back:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  secTitulo:  { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg3, marginBottom: S.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  secCard:    { backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border },
  itemRow:    { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: T.border },
  itemIcon:   { width: 32, height: 32, borderRadius: R.sm, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  itemLabel:  { flex: 1, fontSize: F.size.md, color: T.fg1, fontWeight: F.weight.medium },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.md, borderRadius: R.lg, borderWidth: 1.5, borderColor: T.dangerSoft, backgroundColor: T.dangerSoft },
  logoutText: { fontSize: F.size.md, color: T.danger, fontWeight: F.weight.semibold },
})

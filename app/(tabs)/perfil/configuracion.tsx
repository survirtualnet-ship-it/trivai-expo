import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, Linking, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { User, Bell, Shield, Info, ChevronRight, LogOut } from 'lucide-react-native'
import ScreenHeader from '@/components/ScreenHeader'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'
import { useState, useEffect, useCallback } from 'react'
import { loadNotifPrefs, saveNotifPrefs, type NotifPrefs } from '@/lib/notifPrefs'

export default function Configuracion() {
  const { signOut, user } = useUser()
  const [notifEventos, setNotifEventos] = useState(true)
  const [notifAmigos,  setNotifAmigos]  = useState(true)
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    if (!user?.id) { setLoadingPrefs(false); return }
    loadNotifPrefs(user.id).then(prefs => {
      setNotifEventos(prefs.eventos)
      setNotifAmigos(prefs.amigos)
      setLoadingPrefs(false)
    })
  }, [user?.id])

  const persistPrefs = useCallback(async (prefs: NotifPrefs) => {
    if (!user?.id) return
    setSaving(true)
    try {
      await saveNotifPrefs(user.id, prefs)
    } catch {
      Alert.alert('Error', 'No se pudieron guardar las preferencias.')
    } finally {
      setSaving(false)
    }
  }, [user?.id])

  const toggleEventos = (value: boolean) => {
    setNotifEventos(value)
    persistPrefs({ eventos: value, amigos: notifAmigos })
  }

  const toggleAmigos = (value: boolean) => {
    setNotifAmigos(value)
    persistPrefs({ eventos: notifEventos, amigos: value })
  }

  const cerrarSesion = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await signOut(); router.replace('/auth') } },
    ])
  }

  const abrirPrivacidad = () => {
    Alert.alert(
      'Privacidad',
      'Trivai usa tu ubicación solo para mostrarte lugares cercanos. Tus datos se almacenan de forma segura en Supabase y no se venden a terceros.',
      [{ text: 'Entendido' }],
    )
  }

  const abrirTerminos = () => {
    Alert.alert(
      'Términos de uso',
      'Al usar Trivai aceptas publicar contenido verídico y respetuoso. Nos reservamos el derecho de eliminar contenido inapropiado.',
      [{ text: 'Entendido' }],
    )
  }

  const abrirAyuda = () => {
    Linking.openURL('mailto:survirtualnet@gmail.com?subject=Soporte%20Trivai')
  }

  const secciones = [
    {
      titulo: 'Cuenta',
      items: [
        { icon: User, label: 'Editar perfil', onPress: () => router.push('/perfil/editar') },
      ],
    },
    {
      titulo: 'Notificaciones',
      items: [
        { icon: Bell, label: 'Eventos cercanos', toggle: notifEventos, onToggle: toggleEventos },
        { icon: Bell, label: 'Amigos',           toggle: notifAmigos,  onToggle: toggleAmigos  },
      ],
    },
    {
      titulo: 'Acerca de',
      items: [
        { icon: Shield, label: 'Privacidad',      onPress: abrirPrivacidad },
        { icon: Info,   label: 'Términos de uso', onPress: abrirTerminos },
        { icon: Info,   label: 'Contactar soporte', onPress: abrirAyuda },
        { icon: Info,   label: 'Versión 1.0.0',   onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        title="Configuración"
        right={saving ? <ActivityIndicator size="small" color={T.purple} /> : undefined}
      />

      <ScrollView contentContainerStyle={{ padding: S.lg, gap: S.lg, paddingBottom: 100 }}>
        {loadingPrefs && (
          <ActivityIndicator color={T.purple} style={{ marginVertical: S.md }} />
        )}

        {secciones.map(sec => (
          <View key={sec.titulo}>
            <Text style={styles.secTitulo}>{sec.titulo}</Text>
            <View style={styles.secCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.itemRow, idx < sec.items.length - 1 && styles.itemBorder]}
                  onPress={item.onPress}
                  disabled={item.toggle !== undefined || loadingPrefs}
                >
                  <View style={styles.itemIcon}>
                    <item.icon size={18} color={T.purple} />
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.toggle !== undefined
                    ? (
                      <Switch
                        value={item.toggle}
                        onValueChange={item.onToggle}
                        trackColor={{ true: T.purple }}
                        thumbColor="#fff"
                        disabled={loadingPrefs || saving}
                      />
                    )
                    : item.label === 'Versión 1.0.0'
                      ? <Text style={styles.versionText}>1.0.0</Text>
                      : <ChevronRight size={18} color={T.fg4} />
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={cerrarSesion}>
          <LogOut size={18} color={T.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  secTitulo:   { fontSize: F.size.sm, fontWeight: F.weight.semibold, color: T.fg3, marginBottom: S.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  secCard:     { backgroundColor: T.surface, borderRadius: R.lg, borderWidth: 1, borderColor: T.border },
  itemRow:     { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.md },
  itemBorder:  { borderBottomWidth: 1, borderBottomColor: T.border },
  itemIcon:    { width: 32, height: 32, borderRadius: R.sm, backgroundColor: T.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  itemLabel:   { flex: 1, fontSize: F.size.md, color: T.fg1, fontWeight: F.weight.medium },
  versionText: { fontSize: F.size.sm, color: T.fg3, fontWeight: F.weight.medium },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingVertical: S.md, borderRadius: R.lg, borderWidth: 1.5, borderColor: T.dangerSoft, backgroundColor: T.dangerSoft },
  logoutText:  { fontSize: F.size.md, color: T.danger, fontWeight: F.weight.semibold },
})

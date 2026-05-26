import { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { LogOut, Settings, Star, Heart, MapPin } from 'lucide-react-native'
import { useUser } from '@/hooks/useUser'
import { T, F, S, R } from '@/lib/tokens'

export default function Perfil() {
  const { profile, loading, displayName, initials, isBusiness, signOut } = useUser()

  useEffect(() => {
    if (!loading && !profile) router.replace('/auth')
  }, [loading, profile])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.purple} />
      </View>
    )
  }

  if (!profile) return null

  const menuItems = [
    { icon: Heart,  label: 'Mis favoritos',    onPress: () => {} },
    { icon: Star,   label: 'Mis reseñas',       onPress: () => {} },
    { icon: MapPin, label: 'Lugares visitados', onPress: () => {} },
    { icon: Settings, label: 'Configuración',  onPress: () => {} },
  ]

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
          <Settings size={20} color={T.fg2} />
        </TouchableOpacity>
      </View>

      {/* AVATAR + NOMBRE */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile.full_name || displayName}</Text>
        {profile.username && <Text style={styles.username}>@{profile.username}</Text>}
        {isBusiness && (
          <View style={styles.businessBadge}>
            <Text style={styles.businessBadgeText}>🏢 Cuenta Empresa</Text>
          </View>
        )}
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        {[
          { label: 'Reseñas', value: '0' },
          { label: 'Favoritos', value: '0' },
          { label: 'Amigos', value: '0' },
        ].map(s => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* MENÚ */}
      <View style={styles.menu}>
        {menuItems.map(item => (
          <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
            <item.icon size={20} color={T.purple} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CERRAR SESIÓN */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => { signOut(); router.replace('/auth') }}>
        <LogOut size={18} color={T.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root:              { flex: 1, backgroundColor: T.bg },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.surface, paddingHorizontal: S.lg, paddingVertical: S.md, borderBottomWidth: 1, borderBottomColor: T.border },
  title:             { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  iconBtn:           { width: 36, height: 36, borderRadius: R.full, backgroundColor: T.muted, alignItems: 'center', justifyContent: 'center' },
  hero:              { alignItems: 'center', paddingVertical: S.xl, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  avatar:            { width: 80, height: 80, borderRadius: 40, backgroundColor: T.purple, alignItems: 'center', justifyContent: 'center', marginBottom: S.md },
  avatarText:        { fontSize: 28, fontWeight: F.weight.bold, color: '#fff' },
  name:              { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  username:          { fontSize: F.size.base, color: T.fg3, marginTop: 4 },
  businessBadge:     { marginTop: S.sm, paddingHorizontal: S.md, paddingVertical: 4, backgroundColor: T.purpleSoft, borderRadius: R.full },
  businessBadgeText: { fontSize: F.size.sm, color: T.purple, fontWeight: F.weight.semibold },
  stats:             { flexDirection: 'row', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  stat:              { flex: 1, alignItems: 'center', paddingVertical: S.lg, borderRightWidth: 1, borderRightColor: T.border },
  statValue:         { fontSize: F.size.xl, fontWeight: F.weight.bold, color: T.fg1 },
  statLabel:         { fontSize: F.size.sm, color: T.fg3, marginTop: 2 },
  menu:              { backgroundColor: T.surface, marginTop: S.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border },
  menuRow:           { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingHorizontal: S.lg, paddingVertical: S.lg, borderBottomWidth: 1, borderBottomColor: T.border },
  menuLabel:         { flex: 1, fontSize: F.size.base, color: T.fg1, fontWeight: F.weight.medium },
  menuArrow:         { fontSize: 20, color: T.fg3 },
  logoutBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, margin: S.xl, paddingVertical: S.md, borderRadius: R.lg, borderWidth: 1.5, borderColor: T.dangerSoft, backgroundColor: T.dangerSoft },
  logoutText:        { fontSize: F.size.base, color: T.danger, fontWeight: F.weight.semibold },
})

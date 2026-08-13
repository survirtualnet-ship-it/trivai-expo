import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors, fontWeight, radius } from '@/src/theme'
import { usePermissions } from '@/hooks/usePermissions'

const TAB_CONTENT_HEIGHT = 54

/**
 * Turista → Inicio · Actividades · Mapa · Perfil
 * Empresa → Inicio (dashboard) · Mapa · Perfil Empresa
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const paddingBottom = Math.max(insets.bottom, 8) + 8
  const { isBusinessUser } = usePermissions()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom,
          height: TAB_CONTENT_HEIGHT + 8 + paddingBottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: fontWeight.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Feather name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Actividades',
          href: isBusinessUser ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Feather name="activity" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Feather name="map" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isBusinessUser ? 'Perfil Empresa' : 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Feather name={isBusinessUser ? 'briefcase' : 'user'} size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen name="mi-negocio" options={{ href: null }} />
      <Tabs.Screen name="empresa-plan" options={{ href: null }} />

      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="crear" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="amigos" options={{ href: null }} />
      <Tabs.Screen name="eventos" options={{ href: null }} />
      <Tabs.Screen name="lugares" options={{ href: null }} />
      <Tabs.Screen name="perfil" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 28,
    borderRadius: radius.full,
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
  },
})

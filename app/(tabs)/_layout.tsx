import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Compass, Ticket, Map, Users, User, MapPin } from 'lucide-react-native'
import { T } from '@/lib/tokens'

/** Altura base del contenido (iconos + etiquetas), sin barra del sistema */
const TAB_BAR_CONTENT_HEIGHT = 52

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const bottomInset = Math.max(insets.bottom, 8)
  const paddingBottom = bottomInset + 8

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: T.purple,
        tabBarInactiveTintColor: T.fg3,
        tabBarStyle: {
          backgroundColor: T.surface,
          borderTopColor: T.border,
          paddingTop: 6,
          paddingBottom,
          height: TAB_BAR_CONTENT_HEIGHT + 6 + paddingBottom,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Compass size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="eventos"
        options={{ title: 'Eventos', tabBarIcon: ({ color, size }) => <Ticket size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="mapa"
        options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Map size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="lugares"
        options={{ title: 'Lugares', tabBarIcon: ({ color, size }) => <MapPin size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="amigos"
        options={{ title: 'Amigos', tabBarIcon: ({ color, size }) => <Users size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} color={color}/> }}
      />
    </Tabs>
  )
}

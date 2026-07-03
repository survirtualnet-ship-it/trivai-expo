import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Tabs, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Compass, Map, Users, User, Plus } from 'lucide-react-native'
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
        name="mapa"
        options={{ title: 'Mapa', tabBarIcon: ({ color, size }) => <Map size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="crear"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.fabWrap}
              onPress={() => router.push('/publicar')}
              activeOpacity={0.85}
              accessibilityLabel="Publicar"
              accessibilityRole="button"
            >
              <View style={styles.fab}>
                <Plus size={26} color="#fff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
            router.push('/publicar')
          },
        }}
      />
      <Tabs.Screen
        name="amigos"
        options={{ title: 'Amigos', tabBarIcon: ({ color, size }) => <Users size={size} color={color}/> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} color={color}/> }}
      />
      {/* Pantallas secundarias — accesibles desde Inicio, sin tab visible */}
      <Tabs.Screen name="eventos" options={{ href: null }} />
      <Tabs.Screen name="lugares" options={{ href: null }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: T.fab,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: T.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
})

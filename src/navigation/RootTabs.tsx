/**
 * Tab IA for Trivai tourist shell.
 *
 * Runtime navigation is Expo Router (`app/(tabs)/_layout.tsx`), which wraps
 * React Navigation bottom tabs. Do NOT mount createBottomTabNavigator +
 * NavigationContainer alongside Expo Router — duplicate @react-navigation
 * copies break LinkingContext.
 *
 * Screen map:
 * - Inicio       → src/screens/InicioScreen
 * - Actividades  → src/screens/ActividadesScreen
 * - Mapa         → src/screens/MapaScreen
 * - Perfil       → src/screens/PerfilScreen
 */
export const TAB_ROUTES = [
  { name: 'Inicio', href: '/', icon: 'home' },
  { name: 'Actividades', href: '/activity', icon: 'activity' },
  { name: 'Mapa', href: '/mapa', icon: 'map' },
  { name: 'Perfil', href: '/profile', icon: 'user' },
] as const

export type { RootTabParamList } from './types'

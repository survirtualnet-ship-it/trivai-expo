import { QueryClient } from '@tanstack/react-query'
import { Platform } from 'react-native'

/** Cliente compartido de TanStack Query — importar desde hooks/features al migrar pantallas. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: Platform.OS === 'web',
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

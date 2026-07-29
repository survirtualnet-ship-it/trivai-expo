import { type ReactNode, lazy, Suspense } from 'react'
import { Platform } from 'react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

interface Props {
  children: ReactNode
}

/** ESM import — avoid require()/CJS which duplicates QueryClient context on web. */
const WebReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: function Devtools() {
      return <mod.ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    },
  })),
)

function NativeReactQueryDevtools() {
  const { useReactQueryDevTools } = require('@dev-plugins/react-query') as typeof import('@dev-plugins/react-query')
  useReactQueryDevTools(queryClient)
  return null
}

export function QueryProvider({ children }: Props) {
  const showWebDevtools = __DEV__ && Platform.OS === 'web'
  const showNativeDevtools = __DEV__ && Platform.OS !== 'web'

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showWebDevtools ? (
        <Suspense fallback={null}>
          <WebReactQueryDevtools />
        </Suspense>
      ) : null}
      {showNativeDevtools ? <NativeReactQueryDevtools /> : null}
    </QueryClientProvider>
  )
}

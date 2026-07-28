import { type ReactNode } from 'react'
import { Platform } from 'react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'

interface Props {
  children: ReactNode
}

function WebReactQueryDevtools() {
  const { ReactQueryDevtools } = require('@tanstack/react-query-devtools') as typeof import('@tanstack/react-query-devtools')
  return <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
}

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
      {showWebDevtools ? <WebReactQueryDevtools /> : null}
      {showNativeDevtools ? <NativeReactQueryDevtools /> : null}
    </QueryClientProvider>
  )
}

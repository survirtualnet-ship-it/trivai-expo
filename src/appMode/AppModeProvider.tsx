import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAppModeStore } from './store'
import type { AppMode, AppModeState } from './types'

const AppModeContext = createContext<AppModeState | null>(null)

export function AppModeProvider({ children }: { children: ReactNode }) {
  const mode = useAppModeStore(s => s.mode)
  const setMode = useAppModeStore(s => s.setMode)
  const toggleMode = useAppModeStore(s => s.toggleMode)

  const value = useMemo(
    (): AppModeState => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  )

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  )
}

export function useAppMode(): AppModeState {
  const ctx = useContext(AppModeContext)
  if (!ctx) {
    // Safe fallback outside provider (tests / early render)
    return {
      mode: 'explore',
      setMode: () => {},
      toggleMode: () => {},
    }
  }
  return ctx
}

export function useIsBusinessMode(): boolean {
  return useAppMode().mode === 'business'
}

export type { AppMode }

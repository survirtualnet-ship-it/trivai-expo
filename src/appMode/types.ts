export type AppMode = 'explore' | 'business'

export type AppModeState = {
  mode: AppMode
  setMode: (mode: AppMode) => void
  toggleMode: () => void
}

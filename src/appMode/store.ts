import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import type { AppMode } from './types'

const STORAGE_KEY = 'appMode'

/** Web prefers localStorage (spec); native uses AsyncStorage. */
const storage = createJSONStorage(() => {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return {
      getItem: (name: string) => {
        const value = localStorage.getItem(name)
        return value
      },
      setItem: (name: string, value: string) => {
        localStorage.setItem(name, value)
      },
      removeItem: (name: string) => {
        localStorage.removeItem(name)
      },
    }
  }
  return AsyncStorage
})

type Store = {
  mode: AppMode
  setMode: (mode: AppMode) => void
  toggleMode: () => void
}

export const useAppModeStore = create<Store>()(
  persist(
    (set, get) => ({
      mode: 'explore',
      setMode: mode => set({ mode }),
      toggleMode: () =>
        set({ mode: get().mode === 'explore' ? 'business' : 'explore' }),
    }),
    {
      name: STORAGE_KEY,
      storage,
      partialize: state => ({ mode: state.mode }),
    },
  ),
)

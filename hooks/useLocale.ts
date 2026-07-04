import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AppLocale } from '@/lib/i18n/discover'

const STORAGE_KEY = 'trivai_locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<AppLocale>('es')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === 'es' || stored === 'en') setLocaleState(stored)
      setReady(true)
    })
  }, [])

  const setLocale = useCallback(async (next: AppLocale) => {
    setLocaleState(next)
    await AsyncStorage.setItem(STORAGE_KEY, next)
  }, [])

  return { locale, setLocale, ready }
}

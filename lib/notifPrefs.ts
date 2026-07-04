import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

export type NotifPrefs = {
  eventos: boolean
  amigos:  boolean
}

export const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  eventos: true,
  amigos:  true,
}

const storageKey = (userId: string) => `trivai_notif_prefs_${userId}`

/** ¿Mostrar notificaciones de este tipo según preferencias? */
export function prefAllows(prefs: NotifPrefs, tipo: string): boolean {
  if (tipo === 'evento') return prefs.eventos
  if (tipo === 'amigo')  return prefs.amigos
  return true // system, lugar, etc.
}

export async function loadNotifPrefs(userId: string): Promise<NotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotifPrefs>
      return {
        eventos: parsed.eventos ?? true,
        amigos:  parsed.amigos  ?? true,
      }
    }
  } catch {
    // defaults
  }
  return { ...DEFAULT_NOTIF_PREFS }
}

export async function saveNotifPrefs(userId: string, prefs: NotifPrefs): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(prefs))
  // Sincronizar en auth metadata para recuperar en otros dispositivos
  await supabase.auth.updateUser({
    data: {
      notif_eventos: prefs.eventos,
      notif_amigos:  prefs.amigos,
    },
  })
}

/** Preferencias de cualquier usuario (desde metadata si está disponible) */
export async function getNotifPrefsForUser(userId: string): Promise<NotifPrefs> {
  const local = await loadNotifPrefs(userId)
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.id === userId) {
    const meta = session.user.user_metadata ?? {}
    if (meta.notif_eventos !== undefined || meta.notif_amigos !== undefined) {
      return {
        eventos: meta.notif_eventos !== false,
        amigos:  meta.notif_amigos  !== false,
      }
    }
  }
  return local
}

import { supabase } from './supabase'
import { getNotifPrefsForUser, prefAllows } from './notifPrefs'

type Tipo = 'amigo' | 'evento' | 'lugar' | 'system'

export async function crearNotificacion({
  userId,
  tipo,
  title,
  body,
  emoji,
  data,
}: {
  userId: string
  tipo: Tipo
  title: string
  body?: string
  emoji?: string
  data?: Record<string, unknown>
}) {
  const prefs = await getNotifPrefsForUser(userId)
  if (!prefAllows(prefs, tipo)) return

  await supabase.from('notifications').insert({
    user_id:    userId,
    type:       tipo,
    title,
    body:       body ?? null,
    is_read:    false,
    data:       { emoji: emoji ?? '🔔', ...data },
  })
}

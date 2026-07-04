import { useState, useEffect, useCallback } from 'react'
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Heart } from 'lucide-react-native'
import { T } from '@/lib/tokens'
import {
  isPlaceFavorite,
  isEventSaved,
  togglePlaceFavorite,
  toggleEventSaved,
  withAuth,
} from '@/lib/favorites'

type Props = {
  /** Círculo blanco flotante (sobre fotos) */
  floating?: boolean
  size?: number
  placeId?: string
  eventId?: string
  /** Estado inicial si el padre ya cargó favoritos (ej. lista de eventos) */
  initialActive?: boolean
  /** true = el padre sincroniza el estado; no consultar Supabase al montar */
  managed?: boolean
  onToggle?: (active: boolean) => void
}

export function HeartButton({
  floating = false,
  size = 18,
  placeId,
  eventId,
  initialActive = false,
  managed = false,
  onToggle,
}: Props) {
  const [active, setActive] = useState(initialActive)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setActive(initialActive)
  }, [initialActive])

  useEffect(() => {
    if (managed || (!placeId && !eventId)) return
    let cancelled = false

    withAuth(async userId => {
      const saved = placeId
        ? await isPlaceFavorite(userId, placeId)
        : await isEventSaved(userId, eventId!)
      if (!cancelled) setActive(saved)
    })

    return () => { cancelled = true }
  }, [placeId, eventId, managed])

  const press = useCallback(async () => {
    if (loading) return
    if (!placeId && !eventId) {
      const next = !active
      setActive(next)
      onToggle?.(next)
      return
    }

    setLoading(true)
    const next = !active

    const ok = await withAuth(async userId => {
      if (placeId) await togglePlaceFavorite(userId, placeId, next)
      else if (eventId) await toggleEventSaved(userId, eventId, next)
      return true
    })

    setLoading(false)
    if (ok) {
      setActive(next)
      onToggle?.(next)
    }
  }, [active, eventId, loading, onToggle, placeId])

  return (
    <TouchableOpacity
      style={floating ? styles.floating : styles.plain}
      onPress={press}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="Favorito"
      accessibilityRole="button"
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={floating ? T.fg1 : T.fg4} />
      ) : (
        <Heart
          size={size}
          color={active ? T.danger : floating ? T.fg1 : T.fg4}
          fill={active ? T.danger : 'none'}
          strokeWidth={1.75}
        />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  floating: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  plain: {
    padding: 4,
    minWidth: 26,
    alignItems: 'center',
  },
})

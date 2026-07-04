import { useState, useEffect } from 'react'
import {
  fetchSmartSearchResults,
  type SearchPerson,
} from '@/lib/smartSearch'
import type { PlaceCardData } from '@/components/ui/PlaceCard'
import type { EventCardData } from '@/components/ui/EventCard'

export function useDiscoverSearch(query: string) {
  const [remoteLugares, setRemoteLugares] = useState<PlaceCardData[]>([])
  const [remoteEventos, setRemoteEventos] = useState<EventCardData[]>([])
  const [personas, setPersonas] = useState<SearchPerson[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setRemoteLugares([])
      setRemoteEventos([])
      setPersonas([])
      setSearching(false)
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await fetchSmartSearchResults(q)
        if (!cancelled) {
          setRemoteLugares(results.lugares)
          setRemoteEventos(results.eventos)
          setPersonas(results.personas)
        }
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 280)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return {
    remoteLugares,
    remoteEventos,
    personas,
    searching,
    isActive: query.trim().length > 0,
  }
}

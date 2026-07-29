import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LOCATION_WATCH_INTERVAL_MS, QUERY_KEYS } from '@/lib/constants'
import {
  resolveLocationProfile,
  watchLocationSignificantChange,
  type LocationPermission,
  type UserLocationProfile,
} from '@/services/locationService'

export type LocationProfileState = {
  profile: UserLocationProfile | undefined
  permission: LocationPermission
  offline: boolean
  isLoading: boolean
  refresh: () => Promise<unknown>
  statusMessageEs: string | null
  statusMessageEn: string | null
}

/**
 * Rich location context for Home — GPS, reverse geocode, cache, manual city.
 * (Coords-only GPS remains in useLocation for map/explore callers.)
 */
export function useLocationProfile(): LocationProfileState {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...QUERY_KEYS.location, 'profile'],
    queryFn: () => resolveLocationProfile(),
    staleTime: 60_000,
    refetchInterval: LOCATION_WATCH_INTERVAL_MS,
  })

  useEffect(() => {
    let cleanup: (() => void) | undefined
    void watchLocationSignificantChange(profile => {
      queryClient.setQueryData([...QUERY_KEYS.location, 'profile'], {
        profile,
        permission: 'granted' as const,
        offline: false,
      })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.places })
    }).then(fn => {
      cleanup = fn
    })
    return () => cleanup?.()
  }, [queryClient])

  const permission = query.data?.permission ?? 'undetermined'
  const offline = query.data?.offline ?? false
  const profile = query.data?.profile
  const isLoading = query.isLoading

  let statusMessageEs: string | null = null
  let statusMessageEn: string | null = null

  if (isLoading) {
    statusMessageEs = 'Detectando tu ubicación...'
    statusMessageEn = 'Detecting your location...'
  } else if (offline && profile?.source === 'cache') {
    statusMessageEs = 'Mostrando información guardada.'
    statusMessageEn = 'Showing saved information.'
  } else if (permission === 'denied' && profile?.source !== 'manual') {
    statusMessageEs =
      'No podemos detectar tu ubicación. Selecciona tu ciudad manualmente.'
    statusMessageEn =
      "We can't detect your location. Select your city manually."
  }

  return {
    profile,
    permission,
    offline,
    isLoading,
    refresh: query.refetch,
    statusMessageEs,
    statusMessageEn,
  }
}

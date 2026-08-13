import { useCallback, useEffect, useState } from 'react'
import {
  computeBusinessHealth,
  type BusinessHealthScore,
  type BuildHealthInputParams,
} from '@/lib/domain/business-health'
import { fetchEventCounts, periodRange } from '@/lib/analytics/queries'

type State = {
  health: BusinessHealthScore | null
  recentEventCount: number
  loading: boolean
}

export function useBusinessHealth(params: BuildHealthInputParams | null) {
  const [state, setState] = useState<State>({
    health: null,
    recentEventCount: 0,
    loading: false,
  })

  const refresh = useCallback(async () => {
    if (!params?.placeId) {
      setState({ health: null, recentEventCount: 0, loading: false })
      return
    }

    setState(s => ({ ...s, loading: true }))
    try {
      const range = periodRange('week')
      const counts = await fetchEventCounts(params.placeId, range)
      const recentEventCount = Object.values(counts).reduce((a, b) => a + b, 0)

      const health = computeBusinessHealth({
        ...params,
        recentEventCount,
      })

      setState({ health, recentEventCount, loading: false })
    } catch {
      const health = computeBusinessHealth({ ...params!, recentEventCount: 0 })
      setState({ health, recentEventCount: 0, loading: false })
    }
  }, [params])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { ...state, refresh }
}

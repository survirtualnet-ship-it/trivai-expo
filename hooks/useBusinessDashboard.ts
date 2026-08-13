import { useCallback, useEffect, useState } from 'react'
import type { BusinessSubscriptionTier } from '@/lib/domain/business'
import {
  emptyDashboard,
  fetchBusinessDashboard,
  type BusinessDashboardData,
  type MetricPeriod,
} from '@/lib/analytics/analytics'

type State = {
  data: BusinessDashboardData | null
  loading: boolean
  error: string | null
}

export function useBusinessDashboard(
  placeId: string | null | undefined,
  period: MetricPeriod,
  tier: BusinessSubscriptionTier,
  rating: number,
) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    if (!placeId || tier === 'none') {
      setState({ data: null, loading: false, error: null })
      return
    }

    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchBusinessDashboard(placeId, period, tier, rating)
      setState({ data, loading: false, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar métricas'
      setState({
        data: emptyDashboard(rating, tier),
        loading: false,
        error: msg,
      })
    }
  }, [placeId, period, tier, rating])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { ...state, refresh }
}

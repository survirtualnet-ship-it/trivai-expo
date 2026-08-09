import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import { localDateKey } from '@/lib/homeCache'
import { fetchCurrency, type CurrencySnapshot } from '@/services/currencyService'
import type { Locale } from '@/src/data/mock'

/** Refresh USD rate every time Inicio mounts / app opens. */
export function useCurrency(countryCode: string | undefined, locale: Locale) {
  const dayKey = localDateKey()

  const query = useQuery({
    queryKey: [...QUERY_KEYS.home.currency, countryCode, dayKey],
    queryFn: () => fetchCurrency(countryCode!),
    enabled: !!countryCode,
    staleTime: 0,
    gcTime: 36 * 60 * 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const currency = query.data
  const statusLabel =
    locale === 'EN'
      ? currency?.statusLabelEn ?? 'Stable'
      : currency?.statusLabelEs ?? 'Estable'

  const contextSuffix =
    currency?.source === 'bcb_official'
      ? locale === 'EN'
        ? 'BCB Official'
        : 'Oficial BCB'
      : statusLabel.replace(/^[^\s]+\s/, '')

  const contextLine = currency
    ? `💱 ${currency.pairLabel} · ${contextSuffix}`
    : locale === 'EN'
      ? '💱 USD → — · Stable'
      : '💱 USD → — · Estable'

  const dateLabel = useMemo(() => {
    const formatted = new Date().toLocaleDateString(
      locale === 'EN' ? 'en-US' : 'es',
      { weekday: 'short', day: 'numeric', month: 'short' },
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [locale, dayKey])

  return {
    currency: currency as CurrencySnapshot | undefined,
    pairLabel: currency?.pairLabel ?? 'USD → —',
    rateLabel: currency?.rateLabel ?? '—',
    statusLabel,
    contextLine,
    dateLabel,
    isLoading: query.isLoading && !currency,
  }
}

import { useQuery } from '@tanstack/react-query'
import { CACHE_TTL, QUERY_KEYS } from '@/lib/constants'
import { fetchCurrency, type CurrencySnapshot } from '@/services/currencyService'
import type { Locale } from '@/src/data/mock'

export function useCurrency(countryCode: string | undefined, locale: Locale) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.home.currency, countryCode],
    queryFn: () => fetchCurrency(countryCode!),
    enabled: !!countryCode,
    staleTime: CACHE_TTL.currency,
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

  return {
    currency: currency as CurrencySnapshot | undefined,
    pairLabel: currency?.pairLabel ?? 'USD → —',
    rateLabel: currency?.rateLabel ?? '—',
    statusLabel,
    contextLine,
    isLoading: query.isLoading && !currency,
  }
}

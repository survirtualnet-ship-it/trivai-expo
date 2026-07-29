import {
  CACHE_KEYS,
  CACHE_TTL,
  isFresh,
  readCacheEntry,
  writeCache,
} from '@/lib/homeCache'
import { fetchBcbOfficialUsdRate } from '@/services/bcbRateService'

export type CurrencyStatus = 'stable' | 'variation' | 'important'

export type CurrencySource = 'bcb_official' | 'exchangerate_api' | 'cache'

export type CurrencySnapshot = {
  pairLabel: string
  rateLabel: string
  status: CurrencyStatus
  statusLabelEs: string
  statusLabelEn: string
  localCode: string
  rate: number
  source: CurrencySource
}

type LocalCurrency = { code: string; symbol: string }

const BY_COUNTRY: Record<string, LocalCurrency> = {
  PE: { code: 'PEN', symbol: 'S/' },
  BO: { code: 'BOB', symbol: 'Bs' },
  AR: { code: 'ARS', symbol: '$' },
  CL: { code: 'CLP', symbol: '$' },
  CO: { code: 'COP', symbol: '$' },
  BR: { code: 'BRL', symbol: 'R$' },
  MX: { code: 'MXN', symbol: '$' },
  US: { code: 'USD', symbol: '$' },
}

type ExchangeRateApiResponse = {
  result: string
  rates?: Record<string, number>
  conversion_rates?: Record<string, number>
}

function localCurrency(countryCode: string): LocalCurrency {
  return BY_COUNTRY[countryCode.toUpperCase()] ?? { code: 'USD', symbol: '$' }
}

function statusFromDelta(deltaPct: number): CurrencyStatus {
  const abs = Math.abs(deltaPct)
  if (abs < 0.35) return 'stable'
  if (abs < 1.5) return 'variation'
  return 'important'
}

function statusLabels(status: CurrencyStatus) {
  switch (status) {
    case 'stable':
      return { es: '🟢 Estable', en: '🟢 Stable' }
    case 'variation':
      return { es: '🟡 Variación', en: '🟡 Variation' }
    default:
      return { es: '🔴 Cambio importante', en: '🔴 Major change' }
  }
}

function resolveStatusLabels(
  source: CurrencySource,
  status: CurrencyStatus,
): { es: string; en: string } {
  if (source === 'bcb_official') {
    return { es: 'Oficial BCB', en: 'BCB Official' }
  }
  return statusLabels(status)
}

function withSourceLabels(snapshot: CurrencySnapshot): CurrencySnapshot {
  const labels = resolveStatusLabels(snapshot.source, snapshot.status)
  return { ...snapshot, statusLabelEs: labels.es, statusLabelEn: labels.en }
}

function formatRateLabel(symbol: string, rate: number): string {
  return `1 USD = ${symbol} ${rate.toFixed(2)}`
}

/**
 * ExchangeRate-API (open access or keyed v6).
 * @see https://www.exchangerate-api.com/docs/free
 */
async function fetchExchangeRateApi(toCode: string): Promise<number | null> {
  const key = process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY?.trim()
  const url = key
    ? `https://v6.exchangerate-api.com/v6/${key}/latest/USD`
    : 'https://open.er-api.com/v6/latest/USD'

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json() as ExchangeRateApiResponse
    if (json.result !== 'success') return null
    const rates = json.rates ?? json.conversion_rates
    const rate = rates?.[toCode]
    return rate != null && Number.isFinite(rate) ? rate : null
  } catch {
    return null
  }
}

async function resolveRate(
  countryCode: string,
  localCode: string,
): Promise<{ rate: number; source: CurrencySource } | null> {
  if (countryCode.toUpperCase() === 'BO' && localCode === 'BOB') {
    const official = await fetchBcbOfficialUsdRate()
    if (official != null) {
      return { rate: official, source: 'bcb_official' }
    }
  }

  const market = await fetchExchangeRateApi(localCode)
  if (market != null) {
    return { rate: market, source: 'exchangerate_api' }
  }

  return null
}

export async function fetchCurrency(countryCode: string): Promise<CurrencySnapshot> {
  const cached = await readCacheEntry<CurrencySnapshot>(CACHE_KEYS.currency)
  if (cached && isFresh(cached.savedAt, CACHE_TTL.currency)) {
    return withSourceLabels(cached.data)
  }

  const local = localCurrency(countryCode)
  const pairLabel = `USD → ${local.code}`

  const resolved = await resolveRate(countryCode, local.code)
  if (resolved) {
    let status: CurrencyStatus = 'stable'
    if (cached?.data.rate) {
      const deltaPct = ((resolved.rate - cached.data.rate) / cached.data.rate) * 100
      status = statusFromDelta(deltaPct)
    }

    const labels = resolveStatusLabels(resolved.source, status)
    const snapshot: CurrencySnapshot = {
      pairLabel,
      rateLabel: formatRateLabel(local.symbol, resolved.rate),
      status,
      statusLabelEs: labels.es,
      statusLabelEn: labels.en,
      localCode: local.code,
      rate: resolved.rate,
      source: resolved.source,
    }
    await writeCache(CACHE_KEYS.currency, snapshot)
    return snapshot
  }

  if (cached) {
    return withSourceLabels({ ...cached.data, source: 'cache' })
  }

  const labels = statusLabels('stable')
  return {
    pairLabel,
    rateLabel: `1 USD = ${local.symbol} —`,
    status: 'stable',
    statusLabelEs: labels.es,
    statusLabelEn: labels.en,
    localCode: local.code,
    rate: 0,
    source: 'cache',
  }
}

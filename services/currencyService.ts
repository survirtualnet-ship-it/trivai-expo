import {
  CACHE_KEYS,
  CACHE_TTL,
  isFresh,
  readCacheEntry,
  writeCache,
} from '@/lib/homeCache'

export type CurrencyStatus = 'stable' | 'variation' | 'important'

export type CurrencySnapshot = {
  pairLabel: string
  rateLabel: string
  status: CurrencyStatus
  statusLabelEs: string
  statusLabelEn: string
  localCode: string
  rate: number
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

export async function fetchCurrency(countryCode: string): Promise<CurrencySnapshot> {
  const cached = await readCacheEntry<CurrencySnapshot>(CACHE_KEYS.currency)
  if (cached && isFresh(cached.savedAt, CACHE_TTL.currency)) {
    return cached.data
  }

  const local = localCurrency(countryCode)
  const pairLabel = `USD → ${local.code}`

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${local.code}`,
    )
    if (!res.ok) throw new Error('currency fetch failed')
    const json = await res.json() as { rates?: Record<string, number> }
    const rate = json.rates?.[local.code] ?? 1

    let status: CurrencyStatus = 'stable'
    if (cached?.data.rate) {
      const deltaPct = ((rate - cached.data.rate) / cached.data.rate) * 100
      status = statusFromDelta(deltaPct)
    }

    const labels = statusLabels(status)
    const snapshot: CurrencySnapshot = {
      pairLabel,
      rateLabel: `1 USD = ${local.symbol} ${rate.toFixed(2)}`,
      status,
      statusLabelEs: labels.es,
      statusLabelEn: labels.en,
      localCode: local.code,
      rate,
    }
    await writeCache(CACHE_KEYS.currency, snapshot)
    return snapshot
  } catch {
    if (cached) return cached.data
    const labels = statusLabels('stable')
    return {
      pairLabel,
      rateLabel: `1 USD = ${local.symbol} —`,
      status: 'stable',
      statusLabelEs: labels.es,
      statusLabelEn: labels.en,
      localCode: local.code,
      rate: 0,
    }
  }
}

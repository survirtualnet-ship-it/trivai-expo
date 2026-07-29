import { getLocalCurrency } from '@/services/currencyService'

export type PriceLevel = 1 | 2 | 3

/** Price tier label using the local currency symbol (e.g. Bs, S/, $). */
export function formatPriceTierLabel(level: PriceLevel, countryCode: string): string {
  const { symbol } = getLocalCurrency(countryCode)
  if (symbol === '$') return '$'.repeat(level)
  if (level === 1) return symbol
  return `${symbol}${'+'.repeat(level - 1)}`
}

/** Format a numeric price in the user's local currency. */
export function formatMoney(amount: number, countryCode: string): string {
  const { symbol, code } = getLocalCurrency(countryCode)
  const zeroDecimals = code === 'BOB' || code === 'CLP' || code === 'COP' || code === 'PYG'
  const value = amount.toLocaleString('es-419', {
    minimumFractionDigits: zeroDecimals ? 0 : 2,
    maximumFractionDigits: zeroDecimals ? 0 : 2,
  })

  if (symbol === 'S/' || symbol === 'Bs' || symbol === 'R$') {
    return `${symbol} ${value}`
  }
  return `${symbol}${value}`
}

export function pricePlaceholder(countryCode: string): string {
  const { symbol, code } = getLocalCurrency(countryCode)
  if (code === 'BOB') return `Precio en bolivianos (${symbol})`
  if (code === 'PEN') return `Precio en soles (${symbol})`
  return `Precio en moneda local (${symbol})`
}

const BCB_USD_TABLE_URL =
  'https://www.bcb.gob.bo/librerias/indicadores/otras/ultimo.php'

function parseBsNumber(raw: string): number {
  const normalized = raw.trim().replace(',', '.')
  const value = parseFloat(normalized)
  return Number.isFinite(value) ? value : NaN
}

/** Parse TCO (Bs/USD) from BCB public HTML table. */
export function parseBcbOfficialUsdRate(html: string): number | null {
  const tcoSection = html.match(
    /Cotizaci[oó]n Oficial[\s\S]*?ESTADOS UNIDOS[\s\S]*?USD[\s\S]*?(\d+[.,]\d+)/i,
  )
  if (tcoSection) {
    const rate = parseBsNumber(tcoSection[1])
    if (Number.isFinite(rate)) return rate
  }

  const rowMatch = html.match(
    /ESTADOS UNIDOS[\s\S]*?USD[\s\S]*?(\d+[.,]\d+)/i,
  )
  if (!rowMatch) return null
  const rate = parseBsNumber(rowMatch[1])
  return Number.isFinite(rate) ? rate : null
}

/**
 * Official USD→BOB (TCO) from BCB public page.
 * @see https://www.bcb.gob.bo/?q=cotizaciones_tc
 */
export async function fetchBcbOfficialUsdRate(): Promise<number | null> {
  try {
    const res = await fetch(BCB_USD_TABLE_URL, {
      headers: { Accept: 'text/html,text/plain,*/*' },
    })
    if (!res.ok) return null
    const html = await res.text()
    return parseBcbOfficialUsdRate(html)
  } catch {
    return null
  }
}

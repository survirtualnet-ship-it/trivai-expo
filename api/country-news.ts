import { fetchNewsForCountry } from '../lib/news/boliviaNews'

type VercelRequest = {
  method?: string
  query: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  end: () => void
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
}

function queryParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (Array.isArray(value)) return value[0]?.trim() || null
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const countryCode = queryParam(req.query.countryCode)
  const country = queryParam(req.query.country)

  if (!countryCode || !country) {
    res.status(400).json({ error: 'Faltan parámetros countryCode y country' })
    return
  }

  try {
    const items = await fetchNewsForCountry(countryCode, country)
    res.status(200).json({
      items,
      countryCode,
      country,
      source: countryCode.toUpperCase() === 'BO' ? 'opinion' : 'google',
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al obtener noticias'
    res.status(502).json({ error: message })
  }
}

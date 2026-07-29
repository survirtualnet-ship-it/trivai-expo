export type NewsItem = {
  id: string
  title: string
  link: string
  source: string | null
  publishedAt: string | null
}

type NewsRegion = {
  query: string
  hl: string
  gl: string
  ceid: string
}

const REGION_BY_CODE: Record<string, NewsRegion> = {
  BO: { query: 'Bolivia', hl: 'es-419', gl: 'BO', ceid: 'BO:es-419' },
  PE: { query: 'Perú', hl: 'es-419', gl: 'PE', ceid: 'PE:es-419' },
  AR: { query: 'Argentina', hl: 'es-419', gl: 'AR', ceid: 'AR:es-419' },
  CL: { query: 'Chile', hl: 'es-419', gl: 'CL', ceid: 'CL:es-419' },
  CO: { query: 'Colombia', hl: 'es-419', gl: 'CO', ceid: 'CO:es-419' },
  MX: { query: 'México', hl: 'es-419', gl: 'MX', ceid: 'MX:es-419' },
  BR: { query: 'Brasil', hl: 'pt-BR', gl: 'BR', ceid: 'BR:pt-419' },
  US: { query: 'United States', hl: 'en-US', gl: 'US', ceid: 'US:en' },
}

const NEWS_LIMIT = 5

function resolveRegion(countryCode: string, countryName: string): NewsRegion {
  const mapped = REGION_BY_CODE[countryCode.toUpperCase()]
  if (mapped) return mapped
  return {
    query: countryName,
    hl: 'es-419',
    gl: countryCode.toUpperCase(),
    ceid: `${countryCode.toUpperCase()}:es-419`,
  }
}

export function buildGoogleNewsRssUrl(countryCode: string, countryName: string): string {
  const region = resolveRegion(countryCode, countryName)
  const params = new URLSearchParams({
    q: region.query,
    hl: region.hl,
    gl: region.gl,
    ceid: region.ceid,
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

function extractTag(block: string, tag: string): string | null {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i')
  const plain = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const hit = block.match(cdata) ?? block.match(plain)
  if (!hit?.[1]) return null
  return hit[1].trim()
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function splitTitle(raw: string): { title: string; source: string | null } {
  const clean = decodeHtml(raw)
  const dash = clean.lastIndexOf(' - ')
  if (dash <= 0) return { title: clean, source: null }
  return {
    title: clean.slice(0, dash).trim(),
    source: clean.slice(dash + 3).trim() || null,
  }
}

export function parseGoogleNewsRss(xml: string, limit = NEWS_LIMIT): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1]
    const rawTitle = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    if (!rawTitle || !link) continue

    const { title, source } = splitTitle(rawTitle)
    items.push({
      id: link,
      title,
      link,
      source,
      publishedAt: extractTag(block, 'pubDate'),
    })
  }

  return items
}

async function fetchRssXml(url: string): Promise<string> {
  try {
    const direct = await fetch(url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml' } })
    if (direct.ok) return direct.text()
  } catch {
    // CORS or network — try proxy (common on web)
  }

  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  const proxied = await fetch(proxyUrl)
  if (!proxied.ok) throw new Error('news rss fetch failed')
  return proxied.text()
}

export async function fetchCountryNews(
  countryCode: string,
  countryName: string,
): Promise<NewsItem[]> {
  const url = buildGoogleNewsRssUrl(countryCode, countryName)
  const xml = await fetchRssXml(url)
  return parseGoogleNewsRss(xml)
}

export function formatNewsAge(publishedAt: string | null, locale: 'ES' | 'EN'): string {
  if (!publishedAt) return ''
  const date = new Date(publishedAt)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const hours = Math.floor(diffMs / 3_600_000)
  if (hours < 1) return locale === 'EN' ? 'Just now' : 'Ahora'
  if (hours < 24) return locale === 'EN' ? `${hours}h ago` : `hace ${hours} h`

  const days = Math.floor(hours / 24)
  return locale === 'EN' ? `${days}d ago` : `hace ${days} d`
}

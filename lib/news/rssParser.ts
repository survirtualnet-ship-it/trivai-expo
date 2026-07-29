export type NewsItem = {
  id: string
  title: string
  link: string
  source: string | null
  publishedAt: string | null
}

const NEWS_LIMIT = 5

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

function normalizeTitle(raw: string): string {
  return decodeHtml(raw).replace(/\s+/g, ' ').trim()
}

function pickArticleLink(block: string): string | null {
  const links = [...block.matchAll(/<link>([^<]+)<\/link>/gi)]
  for (const match of links) {
    const href = match[1].trim()
    if (href.includes('/articulo/pais/')) return href
    if (href.includes('opinion.com.bo') && !href.includes('#comentarios')) return href
  }
  return links[0]?.[1]?.trim() ?? null
}

export function parseNewsRss(xml: string, limit = NEWS_LIMIT): NewsItem[] {
  const items: NewsItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[1]
    const rawTitle = extractTag(block, 'title')
    const link = pickArticleLink(block)
    if (!rawTitle || !link) continue

    const creator = extractTag(block, 'dc:creator')
    items.push({
      id: link,
      title: normalizeTitle(rawTitle),
      link,
      source: creator ? normalizeTitle(creator) : null,
      publishedAt: extractTag(block, 'pubDate'),
    })
  }

  return items
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

    const clean = normalizeTitle(rawTitle)
    const dash = clean.lastIndexOf(' - ')
    const title = dash > 0 ? clean.slice(0, dash).trim() : clean
    const source = dash > 0 ? clean.slice(dash + 3).trim() : null

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

export async function fetchGoogleNewsForCountry(
  countryCode: string,
  countryName: string,
): Promise<NewsItem[]> {
  const url = buildGoogleNewsRssUrl(countryCode, countryName)
  const res = await fetch(url, {
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  })
  if (!res.ok) throw new Error(`Google News RSS ${res.status}`)
  const xml = await res.text()
  return parseGoogleNewsRss(xml)
}

import { parseGoogleNewsRss, type NewsItem } from './rssParser'

const PAIS_PAGE = 'https://eldeber.com.bo/pais'
const RSS_FEED = 'https://eldeber.com.bo/rss/feed'
const SOURCE = 'El Deber'
const NEWS_LIMIT = 5

const FETCH_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'User-Agent': 'Trivai/1.0 (+https://trivai-expo.vercel.app)',
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function fixEncoding(text: string): string {
  try {
    return decodeURIComponent(escape(text))
  } catch {
    return text
  }
}

/** JSON-LD ListItem entries on /pais include url + name. */
export function parseElDeberPaisJsonLd(html: string, limit = NEWS_LIMIT): NewsItem[] {
  const items: NewsItem[] = []
  const seen = new Set<string>()
  const regex =
    /"@type"\s*:\s*"ListItem"[\s\S]*?"url"\s*:\s*"(https:\/\/eldeber\.com\.bo\/pais\/[^"]+)"[\s\S]*?"name"\s*:\s*"([^"]+)"/gi

  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null && items.length < limit) {
    const link = match[1]
    if (seen.has(link)) continue
    seen.add(link)
    items.push({
      id: link,
      title: fixEncoding(decodeHtml(match[2].trim())),
      link,
      source: SOURCE,
      publishedAt: null,
    })
  }

  return items
}

/** Fallback: article anchors on the País section page. */
export function parseElDeberPaisLinks(html: string, limit = NEWS_LIMIT): NewsItem[] {
  const items: NewsItem[] = []
  const seen = new Set<string>()
  const regex = /href="(\/pais\/[a-z0-9\-]+_\d+)"/gi

  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null && items.length < limit) {
    const path = match[1]
    if (seen.has(path)) continue
    seen.add(path)
    const link = `https://eldeber.com.bo${path}`
    const slug = path.split('/').pop()?.replace(/_\d+$/, '') ?? path
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    items.push({
      id: link,
      title,
      link,
      source: SOURCE,
      publishedAt: null,
    })
  }

  return items
}

async function fetchElDeberRssPais(limit = NEWS_LIMIT): Promise<NewsItem[]> {
  const res = await fetch(RSS_FEED, { headers: FETCH_HEADERS })
  if (!res.ok) throw new Error(`El Deber RSS ${res.status}`)
  const xml = await res.text()
  return parseGoogleNewsRss(xml, 30)
    .filter(item => item.link.includes('/pais/'))
    .slice(0, limit)
    .map(item => ({ ...item, source: SOURCE }))
}

/**
 * Latest País news from El Deber (https://eldeber.com.bo/pais).
 * Works server-side — used by Vercel API and native app.
 */
export async function fetchElDeberPaisNews(limit = NEWS_LIMIT): Promise<NewsItem[]> {
  const res = await fetch(PAIS_PAGE, { headers: FETCH_HEADERS })
  if (!res.ok) throw new Error(`El Deber País ${res.status}`)
  const html = await res.text()

  const fromJsonLd = parseElDeberPaisJsonLd(html, limit)
  if (fromJsonLd.length > 0) return fromJsonLd

  const fromLinks = parseElDeberPaisLinks(html, limit)
  if (fromLinks.length > 0) return fromLinks

  return fetchElDeberRssPais(limit)
}

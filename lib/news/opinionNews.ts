import { parseNewsRss, type NewsItem } from './rssParser'

export const OPINION_PAIS_RSS = 'https://www.opinion.com.bo/rss/pais/'
const SOURCE = 'Opinión'
const NEWS_LIMIT = 5

const FETCH_HEADERS = {
  Accept: 'application/rss+xml, application/xml, text/xml, */*',
  'User-Agent': 'Trivai/1.0 (+https://trivai-expo.vercel.app)',
}

export async function fetchOpinionPaisNews(limit = NEWS_LIMIT): Promise<NewsItem[]> {
  const res = await fetch(OPINION_PAIS_RSS, { headers: FETCH_HEADERS })
  if (!res.ok) throw new Error(`Opinión RSS ${res.status}`)
  const xml = await res.text()
  return parseNewsRss(xml, limit).map(item => ({
    ...item,
    source: item.source ?? SOURCE,
  }))
}

/** Client-side fallback when CORS blocks direct RSS fetch (web). */
export async function fetchOpinionPaisNewsViaRss2Json(limit = NEWS_LIMIT): Promise<NewsItem[]> {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(OPINION_PAIS_RSS)}`
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error(`rss2json ${res.status}`)

  const json = (await res.json()) as {
    status?: string
    items?: Array<{ title?: string; link?: string; author?: string; pubDate?: string }>
  }
  if (json.status !== 'ok' || !json.items?.length) {
    throw new Error('rss2json invalid response')
  }

  return json.items
    .filter((item): item is { title: string; link: string; author?: string; pubDate?: string } =>
      Boolean(item.title && item.link),
    )
    .slice(0, limit)
    .map(item => ({
      id: item.link,
      title: item.title,
      link: item.link,
      source: item.author?.trim() || SOURCE,
      publishedAt: item.pubDate ?? null,
    }))
}

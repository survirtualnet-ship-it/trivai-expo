import { Platform } from 'react-native'
import { ENV } from '@/lib/env'
import { fetchOpinionPaisNews, fetchOpinionPaisNewsViaRss2Json } from '@/lib/news/opinionNews'
import { fetchNewsForCountry } from '@/lib/news/boliviaNews'
import type { NewsItem } from '@/lib/news/rssParser'

export type { NewsItem } from '@/lib/news/rssParser'
export { buildGoogleNewsRssUrl, parseGoogleNewsRss, parseNewsRss } from '@/lib/news/rssParser'

function newsApiBases(): string[] {
  const bases: string[] = []
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    bases.push(window.location.origin)
  }
  if (ENV.appUrl) bases.push(ENV.appUrl)
  if (ENV.webApiUrl) bases.push(ENV.webApiUrl)
  return bases.filter((url, index, list) => url && list.indexOf(url) === index)
}

async function fetchRssViaProxy(
  baseUrl: string,
  countryCode: string,
  countryName: string,
): Promise<NewsItem[]> {
  const params = new URLSearchParams({ countryCode, country: countryName })
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/country-news?${params.toString()}`)
  const contentType = res.headers.get('content-type') ?? ''
  if (!res.ok || !contentType.includes('json')) {
    throw new Error(`country-news invalid response (${res.status})`)
  }
  const json = await res.json() as { items?: NewsItem[] }
  return json.items ?? []
}

export async function fetchCountryNews(
  countryCode: string,
  countryName: string,
): Promise<NewsItem[]> {
  if (countryCode.toUpperCase() === 'BO' && Platform.OS === 'web') {
    try {
      const items = await fetchOpinionPaisNewsViaRss2Json()
      if (items.length > 0) return items
    } catch {
      // try same-origin API next
    }
  }

  for (const base of newsApiBases()) {
    try {
      const items = await fetchRssViaProxy(base, countryCode, countryName)
      if (items.length > 0) return items
    } catch {
      // try next proxy
    }
  }

  if (countryCode.toUpperCase() === 'BO') {
    try {
      return await fetchOpinionPaisNewsViaRss2Json()
    } catch {
      // web CORS proxy fallback
    }
    try {
      return await fetchOpinionPaisNews()
    } catch {
      // server-side / native direct fetch
    }
  }

  try {
    return await fetchNewsForCountry(countryCode, countryName)
  } catch {
    return []
  }
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

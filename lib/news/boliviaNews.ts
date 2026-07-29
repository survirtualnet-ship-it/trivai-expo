import { fetchOpinionPaisNews, fetchOpinionPaisNewsViaRss2Json } from './opinionNews'
import { fetchGoogleNewsForCountry } from './rssParser'
import { fetchElDeberPaisNews } from './elDeberNews'
export async function fetchNewsForCountry(
  countryCode: string,
  countryName: string,
) {
  if (countryCode.toUpperCase() === 'BO') {
    try {
      const opinion = await fetchOpinionPaisNews()
      if (opinion.length > 0) return opinion
    } catch {
      // fallback
    }
    try {
      return await fetchElDeberPaisNews()
    } catch {
      return []
    }
  }
  return fetchGoogleNewsForCountry(countryCode, countryName)
}

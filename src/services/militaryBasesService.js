/**
 * militaryBasesService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Cost, Client-Side Wikipedia Military Bases Intelligence Engine
 * 
 * Provides:
 *  - Curated global strategic military base registry
 *  - Live Wikipedia article extracts & Wikimedia Commons photography
 *  - Real-time Wikipedia GeoSearch scanner for viewport military installations
 * ─────────────────────────────────────────────────────────────────────────────
 */

import curatedBases from '../data/militaryBases.json'

const WIKI_API = 'https://en.wikipedia.org/w/api.php'

// In-memory cache to prevent redundant Wikipedia API calls
const wikiCache = new Map()

/**
 * Strict military installation keywords for Wikipedia GeoSearch filter
 */
const MILITARY_INSTALLATION_REGEX =
  /(?:air\s+base|air\s+force\s+base|air\s+station|naval\s+base|naval\s+station|naval\s+support|military\s+base|army\s+base|cantonment|barracks|garrison|outpost|forward\s+operating\s+base|command\s+post|missile\s+base|paf\s+base|ins\s+[a-z]+|pns\s+[a-z]+|raf\s+[a-z]+|air\s+force\s+station|fleet\s+activities)/i

/**
 * Returns the base catalog of global military installations
 */
export function getInitialMilitaryBases() {
  return curatedBases
}

/**
 * Fetch live Wikipedia summary, full article URL, and thumbnail image for a base
 */
export async function fetchBaseLiveWiki(wikiTitle, options = {}) {
  const { signal, forceRefresh = false } = options
  if (!wikiTitle) return null

  if (!forceRefresh && wikiCache.has(wikiTitle)) {
    return wikiCache.get(wikiTitle)
  }

  try {
    const url = `${WIKI_API}?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&titles=${encodeURIComponent(
      wikiTitle
    )}&pithumbsize=600&format=json&origin=*`

    const res = await fetch(url, { signal })
    if (!res.ok) return null

    const data = await res.json()
    const pages = data.query?.pages
    if (!pages) return null

    const pageId = Object.keys(pages)[0]
    if (pageId === '-1') return null

    const page = pages[pageId]
    const extractText = page.extract || ''

    // Real-time Wikipedia status & shift analysis (fulfills user request for real-time future tracking)
    let liveStatus = 'active'
    let liveStatusLabel = 'OPERATIONAL / ACTIVE'
    let liveReason = ''

    // Check for relocated / shifted / transferred
    const shiftedMatch = extractText.match(
      /(?:relocated to|moved to|realigned to|shifted to|transferred to|handed over to|turned over to)\s+([^.,;]+)/i
    )
    // Check for closed / decommissioned / evacuated
    const closedMatch = extractText.match(
      /(?:closed in \d{4}|decommissioned in \d{4}|inactivated in \d{4}|evacuated in \d{4}|handed over in \d{4}|closed down|former military base|former air base|former naval base|former royal air force|historic airfield|abandoned|defunct|former united states air force)/i
    )
    // Check for FOB / temporary
    const tempMatch = extractText.match(
      /(?:forward operating base|contingency location|temporary military|expeditionary base|mission support site|patrol base|fob\b)/i
    )

    if (shiftedMatch) {
      liveStatus = 'decommissioned'
      liveStatusLabel = 'SHIFTED / TRANSFERRED'
      liveReason = shiftedMatch[0].trim()
    } else if (closedMatch) {
      liveStatus = 'decommissioned'
      liveStatusLabel = 'DECOMMISSIONED / CLOSED'
      liveReason = closedMatch[0].trim()
    } else if (tempMatch) {
      liveStatus = 'temporary'
      liveStatusLabel = 'FORWARD OPERATING / TEMPORARY'
      liveReason = tempMatch[0].trim()
    }

    const result = {
      title: page.title,
      extract: extractText,
      thumbnail: page.thumbnail?.source || null,
      wiki_url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`,
      liveStatus,
      liveStatusLabel,
      liveReason,
      last_updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }

    wikiCache.set(wikiTitle, result)
    return result
  } catch (err) {
    if (err.name === 'AbortError') return null
    return null
  }
}

const NON_BASE_REGEX =
  /(?:disaster|accident|crash|high\s+school|elementary|middle\s+school|cemetery|memorial|museum|train\s+station|railway|subway|metro|film|song|album|battle\s+of)/i

/**
 * Live GeoSearch: Finds military installations around given coordinates directly from Wikipedia
 * This fulfills: "notun keu military base banaile ba soraile sob amar website e dekha jay"
 */
export async function scanLiveWikiBasesInViewport(lat, lng, radiusKm = 25, options = {}) {
  const { signal } = options
  const radiusMeters = Math.min(Math.max(Math.round(radiusKm * 1000), 1000), 10000) // max 10km per call as per wiki API spec

  try {
    const geoUrl = `${WIKI_API}?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=${radiusMeters}&gslimit=50&format=json&origin=*`
    const res = await fetch(geoUrl, { signal })
    if (!res.ok) return []

    const data = await res.json()
    const rawItems = data.query?.geosearch || []

    // Filter strictly for military-related articles and eliminate non-bases (schools, accidents, museums)
    const militaryArticles = rawItems.filter(
      (item) => MILITARY_INSTALLATION_REGEX.test(item.title) && !NON_BASE_REGEX.test(item.title)
    )

    if (militaryArticles.length === 0) return []

    // Fetch extract & thumbnail for the matched military bases in batch
    const titlesParam = militaryArticles.map((a) => encodeURIComponent(a.title)).join('|')
    const detailUrl = `${WIKI_API}?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&titles=${titlesParam}&pithumbsize=400&format=json&origin=*`

    const detailRes = await fetch(detailUrl, { signal })
    const detailData = await detailRes.json()
    const pagesMap = detailData.query?.pages || {}

    const detailsByTitle = {}
    for (const pid of Object.keys(pagesMap)) {
      const p = pagesMap[pid]
      detailsByTitle[p.title] = p
    }

    return militaryArticles.map((item) => {
      const detail = detailsByTitle[item.title] || {}
      const extractText = detail.extract || ''
      const textLower = extractText.toLowerCase()

      let baseType = 'army_base'
      if (/air\s+base|air\s+force|air\s+station|raf\s+|paf\s+|airstrip|airfield/i.test(item.title)) {
        baseType = 'air_base'
      } else if (/naval|fleet|submarine|pns\s+|ins\s+|dockyard/i.test(item.title)) {
        baseType = 'naval_base'
      } else if (/missile|rocket|silo/i.test(item.title)) {
        baseType = 'missile_facility'
      } else if (/space\s+force|space\s+base/i.test(item.title)) {
        baseType = 'space_base'
      }

      // Live status detection: active, temporary, or decommissioned
      let status = 'active'
      if (/(?:closed\s+in|decommissioned|inactivated|closed\s+down|former\s+military|former\s+air\s+base|former\s+naval\s+base|historic\s+airfield|defunct|abandoned)/i.test(textLower)) {
        status = 'decommissioned'
      } else if (/(?:forward\s+operating\s+base|contingency\s+operating|temporary\s+military|patrol\s+base|fob\b)/i.test(textLower)) {
        status = 'temporary'
      }

      // Country detection from extract text
      let detectedCountry = 'International'
      const countryMatches = [
        { name: 'United States', re: /(?:united states|u\.s\.|american|usaf|us navy|us army)/i },
        { name: 'Russia', re: /(?:russia|russian|soviet|vks)/i },
        { name: 'China', re: /(?:china|chinese|pla|peoples liberation army)/i },
        { name: 'India', re: /(?:india|indian air force|iaf|indian navy|indian army)/i },
        { name: 'Pakistan', re: /(?:pakistan|pakistan air force|paf|pakistan navy)/i },
        { name: 'United Kingdom', re: /(?:united kingdom|british|royal air force|royal navy)/i },
        { name: 'France', re: /(?:france|french air force|french navy)/i },
        { name: 'Germany', re: /(?:germany|german|bundeswehr|luftwaffe)/i },
        { name: 'Japan', re: /(?:japan|japanese|jasdf|jmsdf)/i },
        { name: 'South Korea', re: /(?:south korea|republic of korea|rokaf)/i },
        { name: 'North Korea', re: /(?:north korea|dprk|korean people's army)/i },
        { name: 'Turkey', re: /(?:turkey|turkish)/i },
        { name: 'Israel', re: /(?:israel|israeli|idf)/i },
        { name: 'Iran', re: /(?:iran|iranian|irgc)/i },
        { name: 'Saudi Arabia', re: /(?:saudi arabia|royal saudi)/i },
        { name: 'Bangladesh', re: /(?:bangladesh|baf|bangladesh army|bangladesh navy)/i },
      ]
      for (const cm of countryMatches) {
        if (cm.re.test(textLower) || cm.re.test(item.title)) {
          detectedCountry = cm.name
          break
        }
      }

      return {
        id: `wiki-geo-${item.pageid}`,
        name: item.title,
        wiki_title: item.title,
        country: detectedCountry,
        operator: `${detectedCountry} Armed Forces`,
        type: baseType,
        status,
        category: 'Live Discovered Military Base',
        lat: item.lat,
        lng: item.lon,
        summary: extractText ? extractText.slice(0, 240) + '...' : 'Real-time military installation discovered via Wikipedia GeoSearch.',
        thumbnail: detail.thumbnail?.source || null,
        wiki_url: detail.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        is_live_discovered: true,
      }
    })
  } catch (err) {
    if (err.name === 'AbortError') return []
    return []
  }
}

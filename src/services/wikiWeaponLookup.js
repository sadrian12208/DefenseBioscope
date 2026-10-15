/**
 * wikiWeaponLookup.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Cost, Client-Side Wikipedia Military Systems Coverage & Range Extractor
 *
 * STRICT FILTERING:
 *   - ONLY real military hardware: Missiles, Fighter Jets, UAVs/Drones, Warships/Submarines, Air Defense
 *   - STRICTLY REJECTS: Projects, Programs, Missions, Operations, Military Units/Regiments,
 *     Military Firing Ranges, Bases, Geographic Locations, Treaties, or Conflicts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const WIKI_API = 'https://en.wikipedia.org/w/api.php'

// ═══════════════════════════════════════════════════════════════════════════════
// 1. STRICT HARDWARE INFOBOXES & EXCLUSION RULES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Whitelist: ONLY real weapon/aircraft/ship infoboxes
 */
const STRICT_WEAPON_INFOBOXES = [
  /\{\{\s*infobox\s+weapon/i,
  /\{\{\s*infobox\s+missile/i,
  /\{\{\s*infobox\s+artillery/i,
  /\{\{\s*infobox\s+aircraft/i,
  /\{\{\s*infobox\s+aircraft\s+type/i,
  /\{\{\s*infobox\s+aircraft\s+begin/i,
  /\{\{\s*infobox\s+ship/i,
  /\{\{\s*infobox\s+ship\s+class/i,
  /\{\{\s*infobox\s+ship\s+begin/i,
  /\{\{\s*infobox\s+ship\s+characteristics/i,
  /\{\{\s*infobox\s+submarine/i,
  /\{\{\s*infobox\s+submarine\s+class/i,
  /\{\{\s*infobox\s+naval\s+vessel/i,
  /\{\{\s*infobox\s+military\s+vehicle/i,
  /\{\{\s*aircraft\s+specifications/i,
  /\{\{\s*aircraft\s+specs/i,
]

/**
 * Blacklist of infoboxes: military units, bases, conflicts, missions, organizations
 */
const FORBIDDEN_INFOBOXES = [
  /\{\{\s*infobox\s+military\s+unit/i,
  /\{\{\s*infobox\s+military\s+installation/i,
  /\{\{\s*infobox\s+military\s+structure/i,
  /\{\{\s*infobox\s+military\s+base/i,
  /\{\{\s*infobox\s+military\s+conflict/i,
  /\{\{\s*infobox\s+military\s+memorial/i,
  /\{\{\s*infobox\s+civilian\s+attack/i,
  /\{\{\s*infobox\s+space\s+mission/i,
  /\{\{\s*infobox\s+spaceflight/i,
  /\{\{\s*infobox\s+event/i,
  /\{\{\s*infobox\s+organization/i,
  /\{\{\s*infobox\s+company/i,
  /\{\{\s*infobox\s+person/i,
  /\{\{\s*infobox\s+biography/i,
]

/**
 * Blacklist of terms that indicate projects, programs, missions, regiments,
 * firing ranges, military bases, geographic locations, conflicts, or non-weapons.
 */
const STRICT_EXCLUSIONS = [
  // Projects & Programs (User: "mission ba project egula jano na ase")
  'project ',
  'project-',
  'program ',
  'programme ',
  'initiative ',
  'mission ',
  'missions ',
  'study ',
  'concept ',

  // Military Units, Formations & Regiments
  'regiment',
  'battalion',
  'brigade',
  'division',
  'squadron',
  'flotilla',
  'command',
  'headquarters',
  'military unit',
  'army unit',
  'air force unit',
  'naval unit',
  'armed forces',
  'corps',
  'task force',

  // Military Ranges & Test Grounds (User: "military range egula to kono weapons er nam na")
  'military range',
  'firing range',
  'test range',
  'missile range',
  'proving ground',
  'shooting range',
  'artillery range',
  'bombing range',
  'training range',
  'target range',
  'range (geography)',
  'mountain range',

  // Military Bases & Facilities
  'military base',
  'air base',
  'air force base',
  'naval base',
  'army base',
  'military facility',
  'military installation',
  'cantonment',
  'garrison',
  'fort ',
  'camp ',
  'barracks',
  'test site',
  'launch site',
  'spaceport',
  'cosmodrome',
  'air station',
  'naval station',
  'complex',
  'depot',
  'airfield',

  // Missions, Operations, Battles, Conflicts
  'operation ',
  'exercise ',
  'battle of',
  'war ',
  'conflict',
  'incident',
  'crisis',
  'treaty',
  'doctrine',
  'scandal',
  'strike on',
  'bombing of',
  'siege of',

  // Geography
  'district',
  'province',
  'county',
  'city',
  'village',
  'town',
  'island',
  'river',
  'lake',
  'strait',
  'atoll',
  'sea ',
  'ocean ',

  // Non-military / Media / Entities
  'memorial',
  'museum',
  'cemetery',
  'video game',
  'board game',
  'film',
  'movie',
  'television series',
  'album',
  'soundtrack',
  'fictional',
  'list of',
  'category:',
  'template:',
  'wikipedia:',
  'corporation',
  'company',
  'manufacturer',
  'consortium',
]

/**
 * Check if a title should be rejected immediately
 */
export function isDisallowedTitle(title) {
  if (!title) return true
  const lower = title.toLowerCase().trim()

  // Strict prefix check
  if (
    lower.startsWith('project ') ||
    lower.startsWith('project-') ||
    lower.startsWith('program ') ||
    lower.startsWith('programme ') ||
    lower.startsWith('mission ') ||
    lower.startsWith('operation ') ||
    lower.startsWith('exercise ') ||
    lower.startsWith('battle of ') ||
    lower.startsWith('list of ')
  ) {
    return true
  }

  // Keyword check
  return STRICT_EXCLUSIONS.some((term) => lower.includes(term))
}

const COUNTRY_FLAG_CODES = {
  PAK: 'Pakistan',
  USA: 'United States',
  US: 'United States',
  RUS: 'Russia',
  CHN: 'China',
  IND: 'India',
  IRN: 'Iran',
  PRK: 'North Korea',
  ISR: 'Israel',
  TUR: 'Turkey',
  FRA: 'France',
  UK: 'United Kingdom',
  GBR: 'United Kingdom',
  GER: 'Germany',
  DEU: 'Germany',
  KOR: 'South Korea',
  JPN: 'Japan',
  UKR: 'Ukraine',
  SWE: 'Sweden',
  BRA: 'Brazil',
  ITA: 'Italy',
  TWN: 'Taiwan',
}

export function cleanWikiMarkup(raw) {
  if (!raw) return ''
  let text = String(raw)

  // Comments
  text = text.replace(/<!--[\s\S]*?-->/g, '')

  // References
  text = text.replace(/<ref[^>]*\/>/gi, '')
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')

  // Country Flag templates: {{PAK}}, {{flag|Pakistan}}, {{flagcountry|PAK}}
  text = text.replace(/\{\{(?:flag|flagcountry|flagicon)?\|?([A-Za-z]{2,3})\}\}/g, (m, code) => {
    const upper = code.toUpperCase()
    return COUNTRY_FLAG_CODES[upper] || code
  })

  // Conversion templates {{convert|1500|km|mi|...}} or {{cvt|...}}
  text = text.replace(/\{\{(?:convert|cvt)\|([^|{}]+)\|([^|{}]+)(?:\|[^{}]*)?\}\}/gi, '$1 $2')
  text = text.replace(/\{\{val\|([^|{}]+)\|u=([^|{}]+)(?:\|[^{}]*)?\}\}/gi, '$1 $2')
  text = text.replace(/\{\{val\|([^|{}]+)(?:\|[^{}]*)?\}\}/gi, '$1')
  text = text.replace(/\{\{mach\|([^|{}]+)(?:\|[^{}]*)?\}\}/gi, 'Mach $1')
  text = text.replace(/\{\{nowrap\|([^{}]*)\}\}/gi, '$1')
  text = text.replace(/\{\{formatnum:([^{}]+)\}\}/gi, '$1')
  text = text.replace(/\{\{lang[a-z-]*\|[^|{}]*\|([^{}]+)\}\}/gi, '$1')

  // Raw unclosed convert templates like ≥convert|1000|km|mi or convert|800|km
  text = text.replace(/[≥≤~]?\s*convert\|([\d,]+(?:\.\d+)?)\|([a-zA-Z]+)(?:\|[a-zA-Z0-9=_\s-]*)*/gi, '$1 $2')
  text = text.replace(/\b(?:vehicle_range|operational_range|length|engine|caliber|warhead|is_ranged|abbr=on)\b[=:]?/gi, '')

  let prev = ''
  let depth = 0
  while (prev !== text && depth < 8) {
    prev = text
    text = text.replace(/\{\{[^{}]*\}\}/g, '')
    depth++
  }

  // Links
  text = text.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
  text = text.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1')
  text = text.replace(/\[https?:\/\/[^\s\]]+\]/g, '')

  // HTML
  text = text.replace(/<[^>]+>/g, ' ')
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ndash;|&mdash;/gi, '–')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/g, ' ')

  // Strip remaining curly braces and angle brackets
  text = text.replace(/[{}[\]<>|]/g, ' ')

  text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()
  text = text.replace(/^[|:=\s-]+/, '').replace(/[|:=\s-]+$/, '')
  return text
}

function extractTemplateParam(wikitext, paramNames) {
  const names = Array.isArray(paramNames) ? paramNames : [paramNames]
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\|\\s*${escaped}\\s*=\\s*([\\s\\S]*?)(?=\\n\\s*\\|\\s*\\w[\\w\\s-]*=|\\}\\})`, 'i')
    const match = wikitext.match(regex)
    if (match && match[1] && match[1].trim()) {
      return match[1].trim()
    }
  }
  return null
}

function extractBulletSpec(wikitext, labelPatterns) {
  const patterns = Array.isArray(labelPatterns) ? labelPatterns : [labelPatterns]
  for (const pattern of patterns) {
    const regex = new RegExp(`(?:\\*|;)?\\s*(?:'{2,3})?${pattern}(?:'{2,3})?\\s*[:=]\\s*([^\n\r]+)`, 'i')
    const match = wikitext.match(regex)
    if (match && match[1] && match[1].trim()) {
      return match[1].trim()
    }
  }
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RANGE PARSING & UNIT CONVERSION (KM, NMI, MI, M)
// ═══════════════════════════════════════════════════════════════════════════════

const CONVERSION_FACTORS = {
  nmi: 1.852, // 1 Nautical Mile = 1.852 km
  mi: 1.609344, // 1 Statute Mile = 1.609344 km
  m: 0.001, // 1 Meter = 0.001 km
  km: 1.0,
}

export function parseRangeString(rawRange) {
  if (!rawRange) return null
  const cleaned = cleanWikiMarkup(rawRange)
  if (!cleaned) return null

  const numbersFound = []

  // KM
  const kmRegex = /([\d,]+(?:\.\d+)?)\s*(?:to|–|-)?\s*([\d,]+(?:\.\d+)?)?\s*(?:km|kilometres|kilometers)\b/gi
  let kmMatch
  while ((kmMatch = kmRegex.exec(cleaned)) !== null) {
    const val1 = parseFloat(kmMatch[1].replace(/,/g, ''))
    if (val1 > 0 && val1 < 100000) numbersFound.push({ km: val1, unit: 'km' })
    if (kmMatch[2]) {
      const val2 = parseFloat(kmMatch[2].replace(/,/g, ''))
      if (val2 > 0 && val2 < 100000) numbersFound.push({ km: val2, unit: 'km' })
    }
  }

  // NMI
  const nmiRegex = /([\d,]+(?:\.\d+)?)\s*(?:to|–|-)?\s*([\d,]+(?:\.\d+)?)?\s*(?:nmi|nautical\s+miles?)\b/gi
  let nmiMatch
  while ((nmiMatch = nmiRegex.exec(cleaned)) !== null) {
    const val1 = parseFloat(nmiMatch[1].replace(/,/g, ''))
    if (val1 > 0 && val1 < 100000) numbersFound.push({ km: Math.round(val1 * CONVERSION_FACTORS.nmi), unit: 'nmi' })
    if (nmiMatch[2]) {
      const val2 = parseFloat(nmiMatch[2].replace(/,/g, ''))
      if (val2 > 0 && val2 < 100000) numbersFound.push({ km: Math.round(val2 * CONVERSION_FACTORS.nmi), unit: 'nmi' })
    }
  }

  // MILES
  const miRegex = /([\d,]+(?:\.\d+)?)\s*(?:to|–|-)?\s*([\d,]+(?:\.\d+)?)?\s*(?:mi|miles?)\b/gi
  let miMatch
  while ((miMatch = miRegex.exec(cleaned)) !== null) {
    const val1 = parseFloat(miMatch[1].replace(/,/g, ''))
    if (val1 > 0 && val1 < 100000) numbersFound.push({ km: Math.round(val1 * CONVERSION_FACTORS.mi), unit: 'mi' })
    if (miMatch[2]) {
      const val2 = parseFloat(miMatch[2].replace(/,/g, ''))
      if (val2 > 0 && val2 < 100000) numbersFound.push({ km: Math.round(val2 * CONVERSION_FACTORS.mi), unit: 'mi' })
    }
  }

  // METERS
  const mRegex = /([\d,]+(?:\.\d+)?)\s*(?:m|metres|meters)\b/gi
  let mMatch
  while ((mMatch = mRegex.exec(cleaned)) !== null) {
    const val = parseFloat(mMatch[1].replace(/,/g, ''))
    if (val >= 100 && val < 100000) {
      numbersFound.push({ km: parseFloat((val * CONVERSION_FACTORS.m).toFixed(2)), unit: 'm' })
    }
  }

  // Plain numbers fallback
  if (numbersFound.length === 0) {
    const numRegex = /([\d,]+(?:\.\d+)?)/g
    let match
    while ((match = numRegex.exec(cleaned)) !== null) {
      const val = parseFloat(match[1].replace(/,/g, ''))
      if (val >= 10 && val < 50000) {
        numbersFound.push({ km: val, unit: 'km' })
      }
    }
  }

  if (numbersFound.length === 0) return null

  const kmValues = numbersFound.map((n) => n.km).filter((v) => v > 0)
  const min_km = Math.min(...kmValues)
  const max_km = Math.max(...kmValues)
  const average_km = Math.round(kmValues.reduce((a, b) => a + b, 0) / kmValues.length)

  return {
    km: max_km,
    min_km,
    max_km,
    average_km,
    raw: cleaned,
    display: min_km !== max_km ? `${min_km.toLocaleString()} – ${max_km.toLocaleString()} km` : `${max_km.toLocaleString()} km`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. METADATA EXTRACTORS (SPEED, PAYLOAD, MANUFACTURER, STATUS, ORIGIN)
// ═══════════════════════════════════════════════════════════════════════════════

function extractSpeed(wikitext) {
  const raw =
    extractTemplateParam(wikitext, ['maximum_speed', 'max_speed', 'speed', 'top_speed', 'cruise_speed']) ||
    extractBulletSpec(wikitext, ['Maximum speed', 'Max speed', 'Top speed', 'Speed'])

  if (!raw) return null
  const cleaned = cleanWikiMarkup(raw)
  if (!cleaned || cleaned.length < 2) return null

  const machMatch = cleaned.match(/Mach\s*([\d.]+)/i) || cleaned.match(/([\d.]+)\s*Mach/i)
  if (machMatch) {
    const mach = parseFloat(machMatch[1])
    if (!isNaN(mach) && mach > 0 && mach < 50) {
      const approxKmh = Math.round(mach * 1234.8)
      return `Mach ${mach} (~${approxKmh.toLocaleString()} km/h)`
    }
  }

  const kmhMatch = cleaned.match(/([\d,]+(?:\.\d+)?)\s*km\/h/i)
  if (kmhMatch) return `${kmhMatch[1]} km/h`

  const knotsMatch = cleaned.match(/([\d,]+(?:\.\d+)?)\s*(?:knots|kn)\b/i)
  if (knotsMatch) {
    const kn = parseFloat(knotsMatch[1].replace(/,/g, ''))
    return `${kn} knots (${Math.round(kn * 1.852)} km/h)`
  }

  if (cleaned.match(/\b(?:mph|km\/h|mach|subsonic|supersonic|hypersonic|knots)\b/i)) {
    return cleaned.length < 40 ? cleaned : cleaned.substring(0, 36) + '...'
  }

  return null
}

function extractPayload(wikitext) {
  const raw =
    extractTemplateParam(wikitext, ['warhead', 'warhead_weight', 'payload', 'explosive', 'yield', 'armament', 'payload_capacity']) ||
    extractBulletSpec(wikitext, ['Warhead', 'Payload', 'Armament'])

  if (!raw) return null
  let cleaned = cleanWikiMarkup(raw)
  if (!cleaned || cleaned.length < 2 || cleaned.includes('=')) return null
  cleaned = cleaned.replace(/^(?:warhead|payload|armament)\s*[:=]?\s*/i, '').trim()
  return cleaned.length < 60 ? cleaned : cleaned.substring(0, 55) + '...'
}

function extractManufacturer(wikitext) {
  const raw =
    extractTemplateParam(wikitext, ['manufacturer', 'designer', 'contractor', 'builder', 'produced']) ||
    extractBulletSpec(wikitext, ['Manufacturer', 'Designer'])

  if (!raw) return null
  const cleaned = cleanWikiMarkup(raw)
  if (!cleaned || cleaned.length < 2) return null
  const first = cleaned.split(/[,;\n]/)[0].trim()
  return first.length < 45 ? first : first.substring(0, 40) + '...'
}

function extractServiceStatus(wikitext) {
  const raw =
    extractTemplateParam(wikitext, ['in_service', 'service', 'introduced', 'status', 'produced']) ||
    extractBulletSpec(wikitext, ['In service', 'Introduction', 'Status'])

  if (!raw) return 'Operational'
  const cleaned = cleanWikiMarkup(raw)
  if (!cleaned || cleaned.length < 2) return 'Operational'

  const yearMatch = cleaned.match(/\b(19\d\d|20\d\d)(?:–present| to present)?\b/i)
  if (yearMatch) return yearMatch[0]

  return cleaned.length < 35 ? cleaned : cleaned.substring(0, 30)
}

const COUNTRY_KEYWORDS = [
  [['united states', 'usa', 'us army', 'us navy', 'usaf', 'lockheed', 'boeing', 'raytheon', 'northrop'], 'United States'],
  [['russia', 'russian', 'soviet', 'ussr', 'rostec', 'almaz-antey', 'sukhoi', 'mikoyan', 'tupolev'], 'Russia'],
  [['china', 'chinese', 'people\'s liberation army', 'pla', 'norinco', 'avalanche', 'chengdu', 'shenyang'], 'China'],
  [['pakistan', 'pakistani', 'nescom', 'kahuta', 'ndc', 'suparco'], 'Pakistan'],
  [['india', 'indian', 'drdo', 'brahmos aerospace', 'hindustan aeronautics', 'isro'], 'India'],
  [['iran', 'iranian', 'irgc', 'aerospace force of the islamic'], 'Iran'],
  [['north korea', 'dprk', 'pyongyang'], 'North Korea'],
  [['israel', 'israeli', 'rafael', 'iai', 'israel aerospace', 'idf'], 'Israel'],
  [['turkey', 'turkish', 'türkiye', 'baykar', 'roketsan', 'aselsan', 'tai'], 'Turkey'],
  [['france', 'french', 'dassault', 'thales', 'mbda france', 'safran'], 'France'],
  [['united kingdom', 'british', 'royal air force', 'royal navy', 'bae systems'], 'United Kingdom'],
  [['germany', 'german', 'rheinmetall', 'diehl', 'krauss-maffei'], 'Germany'],
  [['south korea', 'republic of korea', 'rok', 'hanwha', 'kai', 'lig nex1'], 'South Korea'],
  [['japan', 'japanese', 'mitsubishi heavy', 'jasdf'], 'Japan'],
  [['ukraine', 'ukrainian', 'luch design', 'yuzhnoye'], 'Ukraine'],
  [['sweden', 'swedish', 'saab', 'bofors'], 'Sweden'],
  [['brazil', 'brazilian', 'embraer', 'avibras'], 'Brazil'],
  [['italy', 'italian', 'leonardo', 'fincantieri'], 'Italy'],
  [['taiwan', 'taiwanese', 'ncsist'], 'Taiwan'],
]

function extractOrigin(wikitext, title) {
  const raw = extractTemplateParam(wikitext, ['origin', 'place_of_origin', 'country', 'national_origin', 'used_by'])
  if (raw) {
    const cleaned = cleanWikiMarkup(raw)
    if (cleaned && cleaned.length >= 2 && cleaned.length < 60) {
      let first = cleaned.split(/[|;,/\n]/)[0].trim()
      first = first.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '')
      if (first.length >= 2 && !first.toLowerCase().includes('is_ranged')) return first
    }
  }

  const combined = `${title} ${wikitext}`.toLowerCase()
  for (const [terms, country] of COUNTRY_KEYWORDS) {
    if (terms.some((t) => combined.includes(t))) return country
  }
  return 'Global'
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. STRICT HARDWARE TYPE CLASSIFICATION (ONLY MISSILE, AIRCRAFT, DRONE, SHIP, SAM)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Strictly classifies an article into one of the 5 allowed hardware types:
 * missile, aircraft, drone, navy, sam.
 */
function classifySystemType(wikitext, title) {
  const titleLower = title.toLowerCase()
  const rawType = extractTemplateParam(wikitext, ['type', 'class', 'role', 'aircraft_type', 'function']) || ''
  const typeLower = rawType.toLowerCase()
  const fullText = `${title} ${rawType} ${wikitext}`.toLowerCase()

  // 1. High-Priority Title & Infobox Type Matchers

  // Ballistic, Cruise, Hypersonic, and Guided Missiles
  if (
    typeLower.match(/ballistic|cruise|hypersonic|surface-to-surface|anti-ship|air-to-surface|air-to-ground|icbm|slbm|srbm|mrbm|irbm|rocket artillery/i) ||
    titleLower.match(/ballistic missile|cruise missile|qiam|fattah|burkan|scud|tr-1|atacms|prsm|iskander|topol|minuteman|trident|tomahawk|brahmos|shaheen|ghauri|ababeel|jericho|sejjil|khorramshahr|emad|shahab|zolfaghar|fateh|pershing/i)
  ) {
    return { type: 'missile', category: 'Missile System' }
  }

  // True Surface-to-Air / Anti-Aircraft Systems (SAM)
  if (
    typeLower.match(/surface-to-air|anti-aircraft|sam system|air defense system|air defence system|anti-ballistic missile|interceptor missile/i) ||
    titleLower.match(/surface-to-air|anti-aircraft|\bsam\b|air defense|air defence|patriot|iron dome|s-400|s-300|s-500|hq-9|hq-16|david's sling|arrow 3|thaad|nasams|pantsir|tor-m|buk-m|iris-t/i)
  ) {
    return { type: 'sam', category: 'Surface-to-Air Missile (SAM)' }
  }

  // Combat Drones & UAVs
  if (
    typeLower.match(/uav\b|ucav\b|unmanned aerial|unmanned combat|drone\b|loitering munition/i) ||
    titleLower.match(/uav\b|ucav\b|drone\b|bayraktar|shahed|reaper|predator|heron|hermes|ch-4|ch-5|wing loong|orion|altius/i)
  ) {
    return { type: 'drone', category: 'UAV / Combat Drone' }
  }

  // Warships & Naval Vessels
  if (
    typeLower.match(/destroyer|frigate|corvette|cruiser|submarine|warship|aircraft carrier|patrol boat|naval vessel|battleship/i) ||
    titleLower.match(/destroyer|frigate|corvette|cruiser|submarine|aircraft carrier|warship/i)
  ) {
    return { type: 'navy', category: 'Warship / Submarine' }
  }

  // Fighter Jets & Combat Aircraft
  if (
    typeLower.match(/fighter|bomber|strike aircraft|attack aircraft|interceptor|multirole/i) ||
    titleLower.match(/fighter|bomber|f-15|f-16|f-22|f-35|su-27|su-30|su-35|su-57|mig-29|mig-31|mig-35|j-10|j-16|j-20|j-31|eurofighter|rafale|gripen|mirage|tornado/i)
  ) {
    return { type: 'aircraft', category: 'Fighter Jet / Combat Aircraft' }
  }

  // 2. Body Text Verification for Ambiguous Infoboxes

  // Drones
  if (fullText.match(/unmanned combat aerial vehicle|unmanned aerial vehicle|\bucav\b|\buav\b|loitering munition|kamikaze drone/i)) {
    return { type: 'drone', category: 'UAV / Combat Drone' }
  }

  // Fighters & Combat Jets
  if (fullText.match(/multirole combat aircraft|fighter aircraft|stealth fighter|strike fighter|bomber aircraft|attack aircraft/i)) {
    return { type: 'aircraft', category: 'Fighter Jet / Combat Aircraft' }
  }

  // Warships
  if (fullText.match(/guided-missile destroyer|guided-missile frigate|attack submarine|aircraft carrier|amphibious assault ship/i)) {
    return { type: 'navy', category: 'Warship / Submarine' }
  }

  // Ballistic / Cruise / Guided Missiles
  if (fullText.match(/ballistic missile|cruise missile|hypersonic glide vehicle|anti-ship missile|intercontinental ballistic missile|surface-to-surface missile/i)) {
    return { type: 'missile', category: 'Missile System' }
  }

  // Surface-to-Air Missile
  if (fullText.match(/surface-to-air missile system|anti-aircraft missile system|mobile surface-to-air/i)) {
    return { type: 'sam', category: 'Surface-to-Air Missile (SAM)' }
  }

  // General missile fallback if it has missile infobox
  if (wikitext.match(/\{\{\s*infobox\s+(?:missile|rocket|weapon)/i) && fullText.match(/missile|warhead|rocket/i)) {
    return { type: 'missile', category: 'Missile System' }
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. VALIDATION GATE: STRICT WEAPON vs PROJECT / RANGE / UNIT / MISSION
// ═══════════════════════════════════════════════════════════════════════════════

export function validateMilitaryWeapon(title, wikitext) {
  // 1. Strict title exclusion check (projects, programs, missions, regiments, military ranges, bases)
  if (isDisallowedTitle(title)) {
    return {
      isValid: false,
      rejectionReason: 'Not a valid recognized military weapon/aircraft/missile (Projects, programs, missions, military ranges, and army units are strictly excluded).',
    }
  }

  // 2. Reject forbidden infoboxes (military units, bases, conflicts, events)
  if (FORBIDDEN_INFOBOXES.some((pattern) => pattern.test(wikitext))) {
    return {
      isValid: false,
      rejectionReason: 'Not a valid recognized military weapon/aircraft/missile (Identified as a military unit, base, or organization).',
    }
  }

  // 3. Strict whitelist infobox verification
  const hasStrictInfobox = STRICT_WEAPON_INFOBOXES.some((pattern) => pattern.test(wikitext))

  if (hasStrictInfobox) {
    return { isValid: true, rejectionReason: null }
  }

  // 4. Fallback: check for specific weapon hardware parameters
  const hasMilitaryParams =
    /\|\s*(?:warhead|operational_range|combat_range|guidance_system|launch_platform|max_speed)\s*=/i.test(wikitext) ||
    (/==\s*Specifications\s*==/i.test(wikitext) && /'''Range:'''|'''Combat range:'''|'''Warhead:'''/i.test(wikitext))

  if (hasMilitaryParams) {
    return { isValid: true, rejectionReason: null }
  }

  return {
    isValid: false,
    rejectionReason: 'Not a valid recognized military weapon/aircraft/missile',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. WIKIPEDIA THUMBNAIL FETCHER
// ═══════════════════════════════════════════════════════════════════════════════

async function fetchWikiThumbnail(title, signal) {
  try {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=400&format=json&origin=*&redirects=1`
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    const data = await res.json()
    const pages = data.query?.pages
    if (!pages) return null
    const pageId = Object.keys(pages)[0]
    return pages[pageId]?.thumbnail?.source || null
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. fetchWeaponFromWikipedia(weaponName)
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchWeaponFromWikipedia(weaponName, options = {}) {
  const { signal } = options

  if (!weaponName || typeof weaponName !== 'string' || weaponName.trim().length < 2) {
    throw new Error('Weapon name must be at least 2 characters.')
  }

  const queryClean = weaponName.trim()

  // Immediate title check
  if (isDisallowedTitle(queryClean)) {
    throw new Error('Not a valid recognized military weapon/aircraft/missile. Projects, programs, missions, military ranges, and army units are strictly excluded.')
  }

  // Fetch wikitext with redirect resolution
  const parseUrl = `${WIKI_API}?action=parse&page=${encodeURIComponent(queryClean)}&prop=wikitext|properties&format=json&origin=*&redirects=1`
  const res = await fetch(parseUrl, { signal })

  if (!res.ok) {
    throw new Error(`Wikipedia API error: HTTP ${res.status}`)
  }

  const data = await res.json()

  if (data.error) {
    const fallback = await searchWikiClosest(queryClean, signal)
    if (!fallback) {
      throw new Error(`"${queryClean}" not found on Wikipedia.`)
    }
    return fallback
  }

  const resolvedTitle = data.parse?.title || queryClean
  const wikitext = data.parse?.wikitext?.['*'] || ''

  // Validate weapon status
  const validation = validateMilitaryWeapon(resolvedTitle, wikitext)
  if (!validation.isValid) {
    throw new Error(validation.rejectionReason || 'Not a valid recognized military weapon/aircraft/missile')
  }

  // Must strictly classify into one of the 5 allowed hardware types
  const classification = classifySystemType(wikitext, resolvedTitle)
  if (!classification) {
    throw new Error('Not a valid recognized military weapon/aircraft/missile (Only missiles, fighter jets, UAVs, warships, and air defense systems are supported).')
  }

  // Deep Range Extraction
  let operationalRangeParsed = null
  let combatRangeParsed = null
  let ferryRangeParsed = null

  const rawOperational =
    extractTemplateParam(wikitext, ['operational_range', 'max_range', 'maximum_range', 'range', 'firing_range', 'action_radius']) ||
    extractBulletSpec(wikitext, ['Operational range', 'Range', 'Maximum range', 'Firing range'])

  if (rawOperational) operationalRangeParsed = parseRangeString(rawOperational)

  const rawCombat =
    extractTemplateParam(wikitext, ['combat_range', 'combat_radius']) ||
    extractBulletSpec(wikitext, ['Combat range', 'Combat radius'])

  if (rawCombat) combatRangeParsed = parseRangeString(rawCombat)

  const rawFerry =
    extractTemplateParam(wikitext, ['ferry_range']) || extractBulletSpec(wikitext, ['Ferry range'])

  if (rawFerry) ferryRangeParsed = parseRangeString(rawFerry)

  const primaryRange = operationalRangeParsed || combatRangeParsed || ferryRangeParsed

  if (!primaryRange) {
    // Scan text as fallback
    const textMatch = wikitext.match(/(?:operational\s+range|combat\s+range|range\s+of)\s*(?:of\s*)?([\d,]+(?:\.\d+)?)\s*(?:km|kilometres|kilometers|nmi|mi|miles)/i)
    if (textMatch) {
      operationalRangeParsed = parseRangeString(textMatch[0])
    }
  }

  const finalRange = primaryRange || operationalRangeParsed

  // STRICT RULE: If no real range can be extracted, REJECT! (Do not invent fake estimates)
  if (!finalRange || finalRange.km <= 0) {
    throw new Error(`Could not reliably extract operational range data for "${resolvedTitle}" from Wikipedia.`)
  }

  const origin = extractOrigin(wikitext, resolvedTitle)
  const manufacturer = extractManufacturer(wikitext)
  const speed = extractSpeed(wikitext)
  const payload = extractPayload(wikitext)
  const service = extractServiceStatus(wikitext)
  const thumbnail = await fetchWikiThumbnail(resolvedTitle, signal)

  return {
    id: `wiki-${resolvedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: resolvedTitle,
    type: classification.type,
    category: classification.category,
    range_km: Math.round(finalRange.km),
    range_display: finalRange.display,
    range_breakdown: {
      primary_km: Math.round(finalRange.km),
      operational_km: operationalRangeParsed ? Math.round(operationalRangeParsed.km) : null,
      combat_km: combatRangeParsed ? Math.round(combatRangeParsed.km) : null,
      ferry_km: ferryRangeParsed ? Math.round(ferryRangeParsed.km) : null,
      min_km: finalRange.min_km,
      max_km: finalRange.max_km,
      average_km: finalRange.average_km,
    },
    specs: {
      speed: speed || 'Classified / High Subsonic',
      payload: payload || 'Conventional / Specialized Warhead',
      manufacturer: manufacturer || 'Defense Consortium / State Military',
      service_status: service,
      origin: origin,
    },
    origin: origin,
    image_url: thumbnail,
    wiki_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(resolvedTitle.replace(/ /g, '_'))}`,
    isWiki: true,
    confidence: operationalRangeParsed ? 'high' : 'medium',
    validated: true,
  }
}

async function searchWikiClosest(query, signal) {
  try {
    const searchUrl = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&origin=*`
    const res = await fetch(searchUrl, { signal })
    if (!res.ok) return null
    const data = await res.json()
    const candidates = data.query?.search || []

    for (const item of candidates) {
      if (isDisallowedTitle(item.title)) continue
      try {
        const weapon = await fetchWeaponFromWikipedia(item.title, { signal })
        if (weapon) return weapon
      } catch {
        // Continue
      }
    }
  } catch {
    return null
  }
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. searchWeapons(query) FOR SIDEBAR AUTOCOMPLETE
// ═══════════════════════════════════════════════════════════════════════════════

export async function searchWeapons(query, options = {}) {
  const { maxResults = 10, signal } = options
  const errors = []
  const results = []

  if (!query || query.trim().length < 2) {
    return { results: [], errors: ['Query too short. Minimum 2 characters.'] }
  }

  const cleanQuery = query.trim()

  // 1. Strict query blacklist check
  if (isDisallowedTitle(cleanQuery)) {
    return {
      results: [],
      errors: ['Not a valid recognized military weapon/aircraft/missile (Projects, programs, missions, military ranges, and army units are strictly excluded).'],
    }
  }

  // 2. Query Wikipedia Search
  const searchUrl = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&srlimit=15&format=json&origin=*`

  let candidates = []
  try {
    const res = await fetch(searchUrl, { signal })
    if (!res.ok) throw new Error(`Wikipedia search failed: HTTP ${res.status}`)
    const data = await res.json()
    candidates = data.query?.search || []
  } catch (err) {
    if (err.name === 'AbortError') return { results: [], errors: [] }
    return { results: [], errors: [`Wikipedia connection error: ${err.message}`] }
  }

  if (candidates.length === 0) {
    return { results: [], errors: [`No military weapon systems found matching "${query}".`] }
  }

  // 3. Strict filter: Discard any title that is a project, program, mission, unit, or military range
  const filteredCandidates = candidates.filter((item) => !isDisallowedTitle(item.title))

  // 4. Concurrently validate and extract
  const fetchPromises = filteredCandidates.slice(0, 12).map(async (item) => {
    try {
      return await fetchWeaponFromWikipedia(item.title, { signal })
    } catch {
      return null
    }
  })

  const settled = await Promise.allSettled(fetchPromises)

  for (const item of settled) {
    if (item.status === 'fulfilled' && item.value) {
      results.push(item.value)
    }
  }

  // Smart merge: group weapons with same base name and combine as "name1 / name2" + "flag1 / flag2"
  const normalizeBaseName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s*\([^)]*\)\s*/g, '') // Remove parenthetical like "(missile)"
      .replace(/[-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const groups = new Map()
  for (const r of results) {
    const baseKey = normalizeBaseName(r.name)
    if (!groups.has(baseKey)) {
      groups.set(baseKey, [])
    }
    // Avoid exact name duplicates within same group
    const group = groups.get(baseKey)
    if (!group.some((g) => g.name.toLowerCase() === r.name.toLowerCase())) {
      group.push(r)
    }
  }

  const merged = []
  for (const [, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0])
    } else {
      // Merge multiple entries: pick the one with highest range as base, combine names and origins
      group.sort((a, b) => b.range_km - a.range_km)
      const base = { ...group[0] }

      // Collect unique names
      const uniqueNames = [...new Set(group.map((g) => g.name))]
      if (uniqueNames.length > 1) {
        base.name = uniqueNames.join(' / ')
      }

      // Collect unique origins/flags
      const uniqueOrigins = [...new Set(group.map((g) => g.origin).filter(Boolean))]
      if (uniqueOrigins.length > 1) {
        base.origin = uniqueOrigins.join(' / ')
      } else if (uniqueOrigins.length === 1) {
        base.origin = uniqueOrigins[0]
      }

      // Use highest range
      base.range_km = Math.max(...group.map((g) => g.range_km))

      // Merge specs - pick non-empty
      if (!base.specs?.speed) {
        const withSpeed = group.find((g) => g.specs?.speed)
        if (withSpeed) base.specs = { ...base.specs, speed: withSpeed.specs.speed }
      }
      if (!base.specs?.payload) {
        const withPayload = group.find((g) => g.specs?.payload)
        if (withPayload) base.specs = { ...base.specs, payload: withPayload.specs.payload }
      }

      // Use first available image
      if (!base.image_url) {
        const withImg = group.find((g) => g.image_url)
        if (withImg) base.image_url = withImg.image_url
      }

      merged.push(base)
    }
  }

  merged.sort((a, b) => b.range_km - a.range_km)

  return {
    results: merged.slice(0, maxResults),
    errors,
  }
}

export async function lookupWeapon(weaponName, options = {}) {
  try {
    const weapon = await fetchWeaponFromWikipedia(weaponName, options)
    return { weapon, error: null }
  } catch (err) {
    return { weapon: null, error: err.message }
  }
}

export default {
  fetchWeaponFromWikipedia,
  searchWeapons,
  lookupWeapon,
  parseRangeString,
  cleanWikiMarkup,
  validateMilitaryWeapon,
  isDisallowedTitle,
}

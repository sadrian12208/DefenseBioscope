import React, { useState, useMemo } from 'react'

/* =========================================================================
   3D REALISTIC DEFENSE HARDWARE ICONS (Rich Gradients, Highlights & Shading)
   ========================================================================= */

export const Icon3DMissile = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="mslBody" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="mslNose" x1="24" y1="2" x2="24" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="mslFlame" x1="24" y1="38" x2="24" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    {/* Exhaust flame */}
    <path d="M21 38L24 47L27 38" fill="url(#mslFlame)" opacity="0.85" />
    <path d="M22.5 38L24 44L25.5 38" fill="#fef9c3" opacity="0.7" />
    {/* Left fin */}
    <path d="M18 30L12 38L18 36V30Z" fill="#475569" stroke="#334155" strokeWidth="0.5" />
    {/* Right fin */}
    <path d="M30 30L36 38L30 36V30Z" fill="#334155" stroke="#1e293b" strokeWidth="0.5" />
    {/* Small canard fins */}
    <path d="M20 18L16 22L20 21V18Z" fill="#205195ff" />
    <path d="M28 18L32 22L28 21V18Z" fill="#64748b" />
    {/* Main fuselage */}
    <rect x="20" y="12" width="8" height="26" rx="4" fill="url(#mslBody)" />
    {/* Warhead nose cone */}
    <path d="M20 14C20 8 24 2 24 2S28 8 28 14H20Z" fill="url(#mslNose)" />
    {/* Body highlight stripe */}
    <line x1="22" y1="14" x2="22" y2="36" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
    {/* Red band markings */}
    <rect x="20" y="22" width="8" height="1.5" rx="0.5" fill="#ef4444" opacity="0.7" />
    <rect x="20" y="26" width="8" height="1" rx="0.5" fill="#ef4444" opacity="0.5" />
    {/* Nozzle ring */}
    <ellipse cx="24" cy="38" rx="4" ry="1.5" fill="#334155" stroke="#1e293b" strokeWidth="0.5" />
  </svg>
)

export const Icon3DAirDefense = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="adRadar" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="adBase" x1="24" y1="28" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
    </defs>
    {/* Vehicle base / tracked platform */}
    <rect x="10" y="36" width="28" height="8" rx="3" fill="url(#adBase)" />
    <rect x="12" y="40" width="4" height="4" rx="1" fill="#334155" />
    <rect x="18" y="40" width="4" height="4" rx="1" fill="#334155" />
    <rect x="26" y="40" width="4" height="4" rx="1" fill="#334155" />
    <rect x="32" y="40" width="4" height="4" rx="1" fill="#334155" />
    {/* Launcher tubes / rails */}
    <rect x="14" y="20" width="3" height="18" rx="1.5" fill="#94a3b8" transform="rotate(-12 15.5 29)" />
    <rect x="20" y="18" width="3" height="18" rx="1.5" fill="#94a3b8" transform="rotate(-6 21.5 27)" />
    <rect x="26" y="18" width="3" height="18" rx="1.5" fill="#94a3b8" transform="rotate(6 27.5 27)" />
    <rect x="32" y="20" width="3" height="18" rx="1.5" fill="#94a3b8" transform="rotate(12 33.5 29)" />
    {/* Missile tips on tubes */}
    <circle cx="13" cy="19" r="1.8" fill="#ef4444" />
    <circle cx="20" cy="17" r="1.8" fill="#ef4444" />
    <circle cx="28" cy="17" r="1.8" fill="#ef4444" />
    <circle cx="35" cy="19" r="1.8" fill="#ef4444" />
    {/* Radar dish on top */}
    <path d="M20 12C20 8 24 4 24 4S28 8 28 12" stroke="url(#adRadar)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <line x1="24" y1="4" x2="24" y2="16" stroke="#38bdf8" strokeWidth="1.5" />
    {/* Radar pulse rings */}
    <circle cx="24" cy="8" r="6" stroke="#38bdf8" strokeWidth="0.5" fill="none" opacity="0.4" />
    <circle cx="24" cy="8" r="10" stroke="#38bdf8" strokeWidth="0.3" fill="none" opacity="0.2" />
  </svg>
)

export const Icon3DFighterJet = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="jetFuselage" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#7e22ce" />
        <stop offset="100%" stopColor="#581c87" />
      </linearGradient>
      <linearGradient id="jetCanopy" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#082f49" />
      </linearGradient>
      <linearGradient id="afterburner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    {/* Twin Afterburner Flames */}
    <ellipse cx="21" cy="42" rx="2" ry="4" fill="url(#afterburner)" />
    <ellipse cx="27" cy="42" rx="2" ry="4" fill="url(#afterburner)" />
    {/* Left Delta Wing */}
    <path d="M24 16L7 32L17 33L24 28Z" fill="#6b21a8" />
    {/* Right Delta Wing */}
    <path d="M24 16L41 32L31 33L24 28Z" fill="#581c87" />
    {/* Main Stealth Fuselage */}
    <path d="M24 4L20 18L19 36L24 38L29 36L28 18L24 4Z" fill="url(#jetFuselage)" />
    {/* Twin Vertical Stabilizers */}
    <path d="M19 28L14 36L18 36L20 30Z" fill="#a855f7" />
    <path d="M29 28L34 36L30 36L28 30Z" fill="#9333ea" />
    {/* Glass Cockpit Canopy */}
    <ellipse cx="24" cy="14" rx="2" ry="5" fill="url(#jetCanopy)" stroke="#bae6fd" strokeWidth="0.6" />
  </svg>
)

export const Icon3DDrone = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="droneBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="60%" stopColor="#059669" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
    </defs>
    {/* Long High-Aspect Wings */}
    <path d="M24 18L3 22L5 25L24 22L43 25L45 22L24 18Z" fill="#047857" />
    {/* V-Tail Stabilizers */}
    <path d="M24 34L17 41L19 42L24 37L29 42L31 41L24 34Z" fill="#065f46" />
    {/* Aerodynamic Fuselage Pod */}
    <ellipse cx="24" cy="22" rx="4.5" ry="14" fill="url(#droneBody)" />
    {/* Satellite Dome */}
    <ellipse cx="24" cy="13" rx="3" ry="4" fill="#6ee7b7" opacity="0.6" />
    {/* FLIR Gimbal Ball Turret */}
    <circle cx="24" cy="30" r="3" fill="#1e293b" stroke="#34d399" strokeWidth="1" />
    <circle cx="24" cy="30" r="1.2" fill="#38bdf8" />
    {/* Propeller Blade */}
    <line x1="21" y1="36" x2="27" y2="36" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const Icon3DWarship = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="shipHull" x1="24" y1="20" x2="24" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="shipDeck" x1="24" y1="18" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    {/* Water / ocean */}
    <path d="M2 40Q8 37 14 40T26 40T38 40T46 40" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M4 43Q10 40 16 43T28 43T40 43" stroke="#0ea5e9" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.4" />
    {/* Main hull */}
    <path d="M6 36L12 24H36L42 36H6Z" fill="url(#shipHull)" />
    {/* Waterline stripe */}
    <path d="M8 34L12 26H36L40 34H8Z" fill="none" stroke="#64748b" strokeWidth="0.5" />
    {/* Deck superstructure */}
    <rect x="16" y="16" width="14" height="8" rx="1" fill="url(#shipDeck)" />
    {/* Bridge windows */}
    <rect x="18" y="18" width="2" height="1.5" rx="0.3" fill="#bfdbfe" opacity="0.8" />
    <rect x="21.5" y="18" width="2" height="1.5" rx="0.3" fill="#bfdbfe" opacity="0.8" />
    <rect x="25" y="18" width="2" height="1.5" rx="0.3" fill="#bfdbfe" opacity="0.8" />
    {/* Radar mast */}
    <line x1="23" y1="16" x2="23" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="19" y1="10" x2="27" y2="10" stroke="#93c5fd" strokeWidth="1" strokeLinecap="round" />
    {/* Rotating radar bar */}
    <rect x="20" y="8" width="6" height="1.5" rx="0.5" fill="#38bdf8" opacity="0.7" />
    {/* Forward gun turret */}
    <circle cx="13" cy="24" r="2" fill="#cbd5e1" />
    <line x1="13" y1="24" x2="8" y2="21" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
    {/* Rear VLS cells */}
    <rect x="30" y="22" width="4" height="2" rx="0.5" fill="#475569" stroke="#64748b" strokeWidth="0.3" />
    {/* Helipad circle at stern */}
    <circle cx="38" cy="30" r="2.5" stroke="#94a3b8" strokeWidth="0.5" fill="none" strokeDasharray="2 1" />
  </svg>
)

export const Icon3DTank = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="tankHull" x1="24" y1="20" x2="24" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#84cc16" />
        <stop offset="40%" stopColor="#4d7c0f" />
        <stop offset="100%" stopColor="#365314" />
      </linearGradient>
      <linearGradient id="tankTurret" x1="24" y1="14" x2="24" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a3e635" />
        <stop offset="60%" stopColor="#65a30d" />
        <stop offset="100%" stopColor="#3f6212" />
      </linearGradient>
      <linearGradient id="tankTread" x1="24" y1="32" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="tankBarrel" x1="16" y1="16" x2="44" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    {/* Long Main Cannon Gun Barrel */}
    <rect x="22" y="18" width="22" height="3.2" rx="1" fill="url(#tankBarrel)" stroke="#1e293b" strokeWidth="0.5" />
    {/* Muzzle brake at end of barrel */}
    <rect x="42" y="17" width="2.5" height="5.2" rx="0.8" fill="#475569" stroke="#0f172a" strokeWidth="0.5" />
    <rect x="28" y="17.2" width="4" height="4.8" rx="0.8" fill="#475569" />
    {/* Tank Lower Tracks / Treads */}
    <rect x="6" y="32" width="34" height="9" rx="4.5" fill="url(#tankTread)" stroke="#1e293b" strokeWidth="0.8" />
    {/* Road Wheels inside treads */}
    <circle cx="11" cy="36.5" r="3" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
    <circle cx="17.5" cy="36.5" r="3" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
    <circle cx="24" cy="36.5" r="3" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
    <circle cx="30.5" cy="36.5" r="3" fill="#64748b" stroke="#334155" strokeWidth="0.6" />
    <circle cx="36" cy="36.5" r="2.5" fill="#475569" stroke="#334155" strokeWidth="0.6" />
    {/* Tank Armored Sloped Chassis Hull */}
    <path d="M7 32L11 23H35L39 32H7Z" fill="url(#tankHull)" stroke="#1e293b" strokeWidth="0.8" />
    {/* Glacis plate highlight line */}
    <line x1="11" y1="24" x2="35" y2="24" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
    {/* Tank Armored Turret */}
    <path d="M14 24L17 16H29L32 24H14Z" fill="url(#tankTurret)" stroke="#0f172a" strokeWidth="0.8" />
    {/* Commander Cupola / Hatch */}
    <rect x="19" y="13.5" width="6" height="3" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
  </svg>
)

export const Icon3DCustom = ({ className = 'w-7 h-7', ...props }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" {...props}>
    <defs>
      <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="70%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="16" stroke="url(#gearGrad)" strokeWidth="3" strokeDasharray="6 3" />
    <circle cx="24" cy="24" r="8" fill="url(#gearGrad)" />
    <circle cx="24" cy="24" r="4" fill="#1e293b" />
    <circle cx="24" cy="24" r="2" fill="#fef08a" />
  </svg>
)

/* =========================================================================
   REAL COUNTRY FLAG EMOJIS (Using Unicode flag emojis for pixel-perfect flags)
   ========================================================================= */

const COUNTRY_FLAGS = {
  'us': '🇺🇸', 'usa': '🇺🇸', 'united states': '🇺🇸', 'america': '🇺🇸',
  'russia': '🇷🇺', 'soviet': '🇷🇺', 'ussr': '🇷🇺',
  'china': '🇨🇳', 'prc': '🇨🇳',
  'pakistan': '🇵🇰',
  'india': '🇮🇳',
  'north korea': '🇰🇵', 'dprk': '🇰🇵',
  'south korea': '🇰🇷', 'korea': '🇰🇷',
  'japan': '🇯🇵',
  'taiwan': '🇹🇼', 'roc': '🇹🇼',
  'israel': '🇮🇱',
  'iran': '🇮🇷',
  'turkey': '🇹🇷', 'türkiye': '🇹🇷',
  'france': '🇫🇷',
  'uk': '🇬🇧', 'united kingdom': '🇬🇧', 'britain': '🇬🇧', 'british': '🇬🇧',
  'germany': '🇩🇪',
  'italy': '🇮🇹',
  'spain': '🇪🇸',
  'australia': '🇦🇺',
  'brazil': '🇧🇷',
  'canada': '🇨🇦',
  'ukraine': '🇺🇦',
  'norway': '🇳🇴',
  'sweden': '🇸🇪',
  'netherlands': '🇳🇱', 'dutch': '🇳🇱',
  'poland': '🇵🇱',
  'egypt': '🇪🇬',
  'saudi': '🇸🇦', 'saudi arabia': '🇸🇦',
  'uae': '🇦🇪', 'emirates': '🇦🇪',
  'indonesia': '🇮🇩',
  'vietnam': '🇻🇳',
  'thailand': '🇹🇭',
  'singapore': '🇸🇬',
  'malaysia': '🇲🇾',
  'philippines': '🇵🇭',
  'bangladesh': '🇧🇩',
  'south africa': '🇿🇦',
  'argentina': '🇦🇷',
  'mexico': '🇲🇽',
  'greece': '🇬🇷',
  'czech': '🇨🇿', 'czechia': '🇨🇿',
  'switzerland': '🇨🇭', 'swiss': '🇨🇭',
  'belgium': '🇧🇪',
  'finland': '🇫🇮',
  'denmark': '🇩🇰',
  'portugal': '🇵🇹',
  'austria': '🇦🇹',
  'romania': '🇷🇴',
  'hungary': '🇭🇺',
  'serbia': '🇷🇸',
  'croatia': '🇭🇷',
  'bulgaria': '🇧🇬',
  'iraq': '🇮🇶',
  'syria': '🇸🇾',
  'jordan': '🇯🇴',
  'lebanon': '🇱🇧',
  'kuwait': '🇰🇼',
  'qatar': '🇶🇦',
  'bahrain': '🇧🇭',
  'oman': '🇴🇲',
  'yemen': '🇾🇪',
  'libya': '🇱🇾',
  'algeria': '🇩🇿',
  'morocco': '🇲🇦',
  'tunisia': '🇹🇳',
  'nigeria': '🇳🇬',
  'ethiopia': '🇪🇹',
  'kenya': '🇰🇪',
  'colombia': '🇨🇴',
  'chile': '🇨🇱',
  'peru': '🇵🇪',
  'venezuela': '🇻🇪',
  'cuba': '🇨🇺',
  'new zealand': '🇳🇿',
  'myanmar': '🇲🇲', 'burma': '🇲🇲',
  'international': '🌐',
  'nato': '🌐',
  'custom': '⚙️',
}

const COUNTRY_ISO = {
  'us': 'us', 'usa': 'us', 'united states': 'us', 'america': 'us',
  'russia': 'ru', 'soviet': 'ru', 'ussr': 'ru',
  'china': 'cn', 'prc': 'cn',
  'pakistan': 'pk',
  'india': 'in',
  'north korea': 'kp', 'dprk': 'kp',
  'south korea': 'kr', 'korea': 'kr',
  'japan': 'jp',
  'taiwan': 'tw', 'roc': 'tw',
  'israel': 'il',
  'iran': 'ir',
  'turkey': 'tr', 'türkiye': 'tr',
  'france': 'fr',
  'uk': 'gb', 'united kingdom': 'gb', 'britain': 'gb', 'british': 'gb',
  'germany': 'de',
  'italy': 'it',
  'spain': 'es',
  'australia': 'au',
  'brazil': 'br',
  'canada': 'ca',
  'ukraine': 'ua',
  'norway': 'no',
  'sweden': 'se',
  'netherlands': 'nl', 'dutch': 'nl',
  'poland': 'pl',
  'egypt': 'eg',
  'saudi': 'sa', 'saudi arabia': 'sa',
  'uae': 'ae', 'emirates': 'ae',
  'indonesia': 'id',
  'vietnam': 'vn',
  'thailand': 'th',
  'singapore': 'sg',
  'malaysia': 'my',
  'philippines': 'ph',
  'bangladesh': 'bd',
  'south africa': 'za',
  'argentina': 'ar',
  'mexico': 'mx',
  'greece': 'gr',
  'czech': 'cz', 'czechia': 'cz',
  'switzerland': 'ch', 'swiss': 'ch',
  'belgium': 'be',
  'finland': 'fi',
  'denmark': 'dk',
  'portugal': 'pt',
  'austria': 'at',
  'romania': 'ro',
  'hungary': 'hu',
  'serbia': 'rs',
  'croatia': 'hr',
  'bulgaria': 'bg',
  'iraq': 'iq',
  'syria': 'sy',
  'jordan': 'jo',
  'lebanon': 'lb',
  'kuwait': 'kw',
  'qatar': 'qa',
  'bahrain': 'bh',
  'oman': 'om',
  'yemen': 'ye',
  'libya': 'ly',
  'algeria': 'dz',
  'morocco': 'ma',
  'tunisia': 'tn',
  'nigeria': 'ng',
  'ethiopia': 'et',
  'kenya': 'ke',
  'colombia': 'co',
  'chile': 'cl',
  'peru': 'pe',
  'venezuela': 've',
  'cuba': 'cu',
  'new zealand': 'nz',
  'myanmar': 'mm', 'burma': 'mm',
}

function getCountryIso(countryStr) {
  if (!countryStr) return null
  const c = countryStr.toLowerCase().trim()
  if (c === 'custom') return null
  if (COUNTRY_ISO[c]) return COUNTRY_ISO[c]
  for (const [key, iso] of Object.entries(COUNTRY_ISO)) {
    if (key.length <= 2) {
      const regex = new RegExp(`(^|[^a-z0-9])${key}([^a-z0-9]|$)`, 'i')
      if (regex.test(c)) return iso
    } else if (c.includes(key)) {
      return iso
    }
  }
  return null
}

function getFlagEmoji(countryStr) {
  if (!countryStr) return '🌐'
  const c = countryStr.toLowerCase().trim()
  if (c === 'custom') return ''

  // Try direct match first
  if (COUNTRY_FLAGS[c]) return COUNTRY_FLAGS[c]

  // Try matching by partial / multi-country origins like "USA/Germany" or "India/Russia"
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (key.length <= 2) {
      const regex = new RegExp(`(^|[^a-z0-9])${key}([^a-z0-9]|$)`, 'i')
      if (regex.test(c)) return flag
    } else if (c.includes(key)) {
      return flag
    }
  }

  return '🌐'
}

/* Complete Crisp Vector SVG Flags for Major Defense Powers */
const SVG_FLAGS = {
  us: (
    <svg viewBox="0 0 741 390" className="w-full h-full">
      <rect width="741" height="390" fill="#b22234" />
      <path d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741" stroke="#fff" strokeWidth="30" />
      <rect width="296" height="210" fill="#3c3b6e" />
      <circle cx="148" cy="105" r="45" fill="#fff" opacity="0.9" />
      <circle cx="148" cy="105" r="30" fill="#3c3b6e" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 9 6" className="w-full h-full">
      <rect width="9" height="2" fill="#ffffff" />
      <rect y="2" width="9" height="2" fill="#0039a6" />
      <rect y="4" width="9" height="2" fill="#d52b1e" />
    </svg>
  ),
  cn: (
    <svg viewBox="0 0 900 600" className="w-full h-full">
      <rect width="900" height="600" fill="#de2910" />
      <polygon fill="#ffde00" points="150,50 178,136 105,83 195,83 122,136" />
      <circle cx="300" cy="54" r="16" fill="#ffde00" />
      <circle cx="360" cy="114" r="16" fill="#ffde00" />
      <circle cx="360" cy="194" r="16" fill="#ffde00" />
      <circle cx="300" cy="254" r="16" fill="#ffde00" />
    </svg>
  ),
  pk: (
    <svg viewBox="0 0 900 600" className="w-full h-full">
      <rect width="900" height="600" fill="#01411c" />
      <rect width="225" height="600" fill="#ffffff" />
      <circle cx="562" cy="300" r="170" fill="#ffffff" />
      <circle cx="615" cy="270" r="150" fill="#01411c" />
      <polygon fill="#ffffff" points="630,230 638,255 617,240 643,240 622,255" />
    </svg>
  ),
  in: (
    <svg viewBox="0 0 9 6" className="w-full h-full">
      <rect width="9" height="2" fill="#ff9933" />
      <rect y="2" width="9" height="2" fill="#ffffff" />
      <rect y="4" width="9" height="2" fill="#138808" />
      <circle cx="4.5" cy="3" r="0.75" fill="none" stroke="#000080" strokeWidth="0.18" />
      <circle cx="4.5" cy="3" r="0.25" fill="#000080" />
    </svg>
  ),
  kp: (
    <svg viewBox="0 0 72 36" className="w-full h-full">
      <rect width="72" height="6" fill="#024fa2" />
      <rect y="6" width="72" height="2" fill="#ffffff" />
      <rect y="8" width="72" height="20" fill="#ed1b2e" />
      <rect y="28" width="72" height="2" fill="#ffffff" />
      <rect y="30" width="72" height="6" fill="#024fa2" />
      <circle cx="24" cy="18" r="8" fill="#ffffff" />
      <polygon fill="#ed1b2e" points="24,11 26.5,17 33,17 28,21 30,27 24,23 18,27 20,21 15,17 21.5,17" />
    </svg>
  ),
  kr: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#ffffff" />
      <circle cx="1.5" cy="1" r="0.5" fill="#cd2e3a" />
      <path d="M1.5,1 A0.25,0.25 0 0,1 1.5,1.5 A0.5,0.5 0 0,1 1.5,0.5 A0.25,0.25 0 0,0 1.5,1" fill="#0047a0" />
    </svg>
  ),
  ir: (
    <svg viewBox="0 0 7 4" className="w-full h-full">
      <rect width="7" height="1.33" fill="#239f40" />
      <rect y="1.33" width="7" height="1.33" fill="#ffffff" />
      <rect y="2.66" width="7" height="1.34" fill="#da0000" />
      <circle cx="3.5" cy="2" r="0.4" fill="#da0000" />
    </svg>
  ),
  il: (
    <svg viewBox="0 0 220 160" className="w-full h-full">
      <rect width="220" height="160" fill="#ffffff" />
      <rect y="15" width="220" height="25" fill="#0038b8" />
      <rect y="120" width="220" height="25" fill="#0038b8" />
      <polygon points="110,50 135,95 85,95" stroke="#0038b8" strokeWidth="5.5" fill="none" />
      <polygon points="110,110 135,65 85,65" stroke="#0038b8" strokeWidth="5.5" fill="none" />
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 1200 800" className="w-full h-full">
      <rect width="1200" height="800" fill="#e30a17" />
      <circle cx="500" cy="400" r="200" fill="#ffffff" />
      <circle cx="550" cy="400" r="160" fill="#e30a17" />
      <polygon fill="#ffffff" points="680,400 740,420 710,360 760,390 700,370" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#002395" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ed2939" />
    </svg>
  ),
  gb: (
    <svg viewBox="0 0 60 30" className="w-full h-full">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" />
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 5 3" className="w-full h-full">
      <rect width="5" height="1" fill="#000000" />
      <rect y="1" width="5" height="1" fill="#dd0000" />
      <rect y="2" width="5" height="1" fill="#ffce00" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="1" height="2" fill="#009246" />
      <rect x="1" width="1" height="2" fill="#ffffff" />
      <rect x="2" width="1" height="2" fill="#ce2b37" />
    </svg>
  ),
  br: (
    <svg viewBox="0 0 720 504" className="w-full h-full">
      <rect width="720" height="504" fill="#009c3b" />
      <polygon points="360,60 670,252 360,444 50,252" fill="#ffdf00" />
      <circle cx="360" cy="252" r="120" fill="#002776" />
    </svg>
  ),
  ua: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="1" fill="#0057b7" />
      <rect y="1" width="3" height="1" fill="#ffd700" />
    </svg>
  ),
  jp: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#ffffff" />
      <circle cx="1.5" cy="1" r="0.6" fill="#bc002d" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 1280 640" className="w-full h-full">
      <rect width="1280" height="640" fill="#00008b" />
      <rect width="640" height="320" fill="#012169" />
      <path d="M0,0 L640,320 M640,0 L0,320" stroke="#fff" strokeWidth="60" />
      <path d="M0,0 L640,320 M640,0 L0,320" stroke="#c8102e" strokeWidth="40" />
      <path d="M320,0 V320 M0,160 H640" stroke="#fff" strokeWidth="100" />
      <path d="M320,0 V320 M0,160 H640" stroke="#c8102e" strokeWidth="60" />
      <circle cx="960" cy="480" r="30" fill="#ffffff" />
      <circle cx="1100" cy="360" r="25" fill="#ffffff" />
      <circle cx="1140" cy="240" r="25" fill="#ffffff" />
      <circle cx="1020" cy="180" r="25" fill="#ffffff" />
    </svg>
  ),
  no: (
    <svg viewBox="0 0 22 16" className="w-full h-full">
      <rect width="22" height="16" fill="#ba0c2f" />
      <path d="M0,8H22M8,0V16" stroke="#fff" strokeWidth="4" />
      <path d="M0,8H22M8,0V16" stroke="#00205b" strokeWidth="2" />
    </svg>
  ),
  se: (
    <svg viewBox="0 0 16 10" className="w-full h-full">
      <rect width="16" height="10" fill="#006aa7" />
      <path d="M0,5H16M5,0V10" stroke="#fecc00" strokeWidth="2" />
    </svg>
  ),
  nl: (
    <svg viewBox="0 0 9 6" className="w-full h-full">
      <rect width="9" height="2" fill="#ae1c28" />
      <rect y="2" width="9" height="2" fill="#ffffff" />
      <rect y="4" width="9" height="2" fill="#21468b" />
    </svg>
  ),
  tw: (
    <svg viewBox="0 0 3 2" className="w-full h-full">
      <rect width="3" height="2" fill="#fe0000" />
      <rect width="1.5" height="1" fill="#000095" />
      <circle cx="0.75" cy="0.5" r="0.25" fill="#ffffff" />
      <circle cx="0.75" cy="0.5" r="0.18" fill="#000095" />
    </svg>
  ),
}

export const splitCountries = (origin = '') => {
  if (!origin) return []
  return origin.split(/\s*[\/&,]\s*/).map((c) => c.trim()).filter(Boolean)
}

export const IconCountryBadge = ({ country = '', className = '', ...props }) => {
  const [imgError, setImgError] = useState(false)

  if (!country || country.toLowerCase() === 'custom' || country.toLowerCase() === 'tank') {
    return null
  }

  // Handle merged countries like "India/Russia" or "Iran / North Korea"
  if (country && (country.includes('/') || country.includes(','))) {
    const countries = splitCountries(country)
    if (countries.length > 1) {
      return (
        <span className={`inline-flex items-center gap-1 shrink-0 ${className}`} title={country} {...props}>
          {countries.map((c, i) => (
            <span key={c + i} className="inline-flex items-center gap-0.5 shrink-0">
              {i > 0 && <span className="text-[9px] text-slate-400 font-bold mx-0.5">/</span>}
              <IconCountryBadge country={c} className="!mx-0" />
            </span>
          ))}
        </span>
      )
    }
  }

  const iso = useMemo(() => getCountryIso(country), [country])
  const svgFlag = iso && SVG_FLAGS[iso]

  // Priority 1: High quality offline vector SVG flag
  if (svgFlag) {
    return (
      <span
        className={`w-4 h-2.5 inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] shadow-xs border border-white/10 ${className}`}
        title={country}
        {...props}
      >
        {svgFlag}
      </span>
    )
  }

  // Priority 2: Online FlagCDN image
  if (iso && !imgError) {
    return (
      <img
        src={`https://flagcdn.com/w40/${iso}.png`}
        alt={country || 'flag'}
        className={`w-4 h-2.5 object-cover rounded-[2px] shadow-xs shrink-0 inline-block align-middle border border-white/10 ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
        {...props}
      />
    )
  }

  // Priority 3: Fallback to emoji
  const flag = getFlagEmoji(country)
  if (!flag) return null

  return (
    <span
      className={className}
      role="img"
      aria-label={country || 'country flag'}
      style={{ fontSize: '13px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      {...props}
    >
      {flag}
    </span>
  )
}

/**
 * OriginDisplay: Renders flags AND names for single and multi-country origin weapons
 * e.g. "India/Russia" -> [🇮🇳 India] / [🇷🇺 Russia]
 */
export const OriginDisplay = ({
  origin = '',
  className = '',
  flagClass = '',
  textClass = '',
  showNames = true,
  separator = '/',
}) => {
  if (!origin) return null
  if (origin.toLowerCase() === 'custom' || origin.toLowerCase() === 'tank') {
    return showNames ? <span className={textClass}>{origin}</span> : null
  }

  const countries = useMemo(() => splitCountries(origin), [origin])
  if (countries.length === 0) return null

  if (countries.length === 1) {
    return (
      <span className={`inline-flex items-center gap-1 shrink-0 ${className}`}>
        <IconCountryBadge country={countries[0]} className={flagClass} />
        {showNames && <span className={textClass}>{countries[0]}</span>}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center flex-wrap gap-x-1.5 gap-y-0.5 shrink-0 ${className}`}>
      {countries.map((c, idx) => (
        <span key={c + idx} className="inline-flex items-center gap-1 shrink-0">
          {idx > 0 && <span className="text-text-muted text-[9px] font-bold mx-0.5 opacity-60">{separator}</span>}
          <IconCountryBadge country={c} className={flagClass} />
          {showNames && <span className={textClass}>{c}</span>}
        </span>
      ))}
    </span>
  )
}

/* =========================================================================
   STANDARD UTILITY & NAVIGATION ICONS
   ========================================================================= */

export const IconCrosshair = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

export const IconSearch = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16" y2="16" />
  </svg>
)

export const IconPin = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const IconPlus = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export const IconSun = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

export const IconMoon = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

export const IconClose = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const IconTrash = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

export const IconEye = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconEyeOff = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export const IconExternalLink = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export const IconAlert = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const IconGlobe = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

export const IconSpeed = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export const IconBlast = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2l2.4 5.6L20 8.5l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.6-.9L12 2z" />
  </svg>
)

export const IconLayers = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

/* Compass / Globe Reset icon - for the floating button to reset globe view */
export const IconCompass = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.3" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)

/* Flat Earth / 2D Map Icon */
export const IconMap = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

/* Crossed Swords Military Icon (⚔) */
export const IconSwords = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" y1="20" x2="14" y2="10" />
    <line x1="20" y1="4" x2="14" y2="10" />
    <polyline points="14 4 20 4 20 10" />
    <line x1="20" y1="20" x2="10" y2="10" />
    <line x1="4" y1="4" x2="10" y2="10" />
    <polyline points="10 4 4 4 4 10" />
    <line x1="7" y1="17" x2="3" y2="21" />
    <line x1="17" y1="17" x2="21" y2="21" />
  </svg>
)

/* Military Outpost / Base Fortress Icon */
export const IconMilitaryBase = ({ className = 'w-4 h-4', ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 21h18" />
    <path d="M5 21V7l3-3 4 4 4-4 3 3v14" />
    <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
    <circle cx="12" cy="11" r="1.5" fill="currentColor" />
  </svg>
)



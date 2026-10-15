import { useState, useRef, useEffect, useMemo } from 'react'
import {
  IconCrosshair,
  IconSearch,
  IconPin,
  IconSun,
  IconMoon,
  IconClose,
} from './Icons'

const CITIES = [
  { name: 'New York', country: 'US', lat: 40.7128, lng: -74.006 },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
  { name: 'Tehran', country: 'Iran', lat: 35.6892, lng: 51.389 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753 },
  { name: 'Kyiv', country: 'Ukraine', lat: 50.4501, lng: 30.5234 },
  { name: 'Ankara', country: 'Turkey', lat: 39.9334, lng: 32.8597 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978 },
  { name: 'Taipei', country: 'Taiwan', lat: 25.033, lng: 121.5654 },
  { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Washington DC', country: 'US', lat: 38.9072, lng: -77.0369 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  { name: 'Pyongyang', country: 'North Korea', lat: 39.0392, lng: 125.7625 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122 },
  { name: 'Brasilia', country: 'Brazil', lat: -15.7975, lng: -47.8919 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
]

export default function TopBar({
  placingMode,
  selectedSystem,
  onCancelPlacing,
  onToggleSidebar,
  onToggleLayers,
  sidebarOpen,
  mobileExpanded,
  onToggleMobileSheet,
  onGoToLocation,
  theme = 'dark',
  onToggleTheme,
}) {
  const [locSearch, setLocSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [coordInput, setCoordInput] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const wrapperRef = useRef(null)

  const suggestions = useMemo(() => {
    if (!locSearch.trim()) return []
    const q = locSearch.toLowerCase()
    return CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [locSearch])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectCity = (city) => {
    onGoToLocation(city.lat, city.lng, 6)
    setLocSearch('')
    setShowSuggestions(false)
  }

  const handleCoordGo = (e) => {
    e.preventDefault()
    if (lat && lng) {
      onGoToLocation(Number(lat), Number(lng), 6)
      setLat('')
      setLng('')
      setCoordInput(false)
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-[1001] pointer-events-none p-1.5 sm:p-3">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 max-w-7xl mx-auto">
        {/* Left Section: Sidebar Toggle & Brand Title */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth <= 768 && onToggleMobileSheet) {
                onToggleMobileSheet()
              } else if (onToggleSidebar) {
                onToggleSidebar()
              }
            }}
            className="nm-btn w-10 sm:w-11 h-10 sm:h-11 rounded-xl text-text-primary hover:text-white"
            title={sidebarOpen ? 'Collapse Systems Panel' : 'Expand Systems Panel'}
            aria-label="Toggle Systems Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen || mobileExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Brand */}
          <div className="hidden sm:flex items-center gap-2.5 h-11 px-3.5 nm-card border border-white/5 select-none">
            <IconCrosshair className="w-4 h-4 text-accent-blue" />
            <span className="text-xs font-black tracking-wider uppercase text-text-primary">
              DefenseBioscope
            </span>
          </div>

          {/* Mobile Brand */}
          <div className="flex sm:hidden items-center gap-1.5 h-10 px-2 nm-card border border-white/5 select-none shrink-0">
            <IconCrosshair className="w-3.5 h-3.5 text-accent-blue" />
            <span className="text-[10.5px] font-black uppercase text-text-primary tracking-wide">
              BIOSCOPE
            </span>
          </div>
        </div>

        {/* Center Section: Location Navigation & Coordinates */}
        <div className="flex-1 max-w-md pointer-events-auto min-w-0 mx-1" ref={wrapperRef}>
          {!coordInput ? (
            <div className="relative flex items-center">
              <span className="absolute left-2.5 sm:left-3.5 z-10 pointer-events-none text-text-muted flex items-center">
                <IconSearch className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </span>
              <input
                type="text"
                value={locSearch}
                onChange={(e) => {
                  setLocSearch(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search city / theater..."
                style={{ paddingLeft: '32px', paddingRight: '32px' }}
                className="nm-input w-full h-10 sm:h-11 rounded-xl text-xs sm:text-sm font-medium"
              />

              <button
                type="button"
                onClick={() => setCoordInput(true)}
                className="absolute right-2 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer flex items-center"
                title="Input exact coordinates"
                aria-label="Input exact coordinates"
              >
                <IconPin className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-13 left-0 right-0 nm-card p-1 shadow-2xl z-50 max-h-64 overflow-y-auto">
                  {suggestions.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectCity(c)}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-text-primary hover:bg-white/5 rounded-lg transition-all flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                        {c.country}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCoordGo} className="flex gap-1.5 justify-center items-center">
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Lat"
                className="nm-input w-20 sm:w-28 h-10 sm:h-11 px-2 rounded-xl text-xs text-center font-mono"
              />
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="Lng"
                className="nm-input w-20 sm:w-28 h-10 sm:h-11 px-2 rounded-xl text-xs text-center font-mono"
              />
              <button
                type="button"
                onClick={() => setCoordInput(false)}
                className="nm-btn h-10 sm:h-11 w-10 sm:w-11 rounded-xl text-text-muted hover:text-accent-red"
                aria-label="Cancel coordinates"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Section removed per request */}
      </div>

      {/* Target Placement Status Banner */}
      {placingMode && selectedSystem && (
        <div className="mt-1.5 sm:mt-2 max-w-md mx-auto pointer-events-auto px-2">
          <div className="nm-card px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between border-accent-blue/40 shadow-lg">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse shrink-0"></span>
              <span className="text-[11px] sm:text-xs text-text-primary font-medium truncate">
                Tap map to deploy <strong>{selectedSystem.name}</strong> ({selectedSystem.range_km} km)
              </span>
            </div>
            <button
              onClick={onCancelPlacing}
              className="ml-2 text-xs font-bold text-text-muted hover:text-accent-red px-2 py-1 rounded nm-btn shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

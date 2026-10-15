import { useState, useCallback, useEffect, useMemo } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MobileSheet from './components/MobileSheet'
import systemsData from './data/systems.json'

function App() {
  const [placedSystems, setPlacedSystems] = useState([])
  const [selectedSystem, setSelectedSystem] = useState(null)
  const [placingMode, setPlacingMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('defensebioscope_theme') || 'dark'
  })
  const [visibleTypes, setVisibleTypes] = useState({
    sam: true,
    missile: true,
    aircraft: true,
    drone: true,
    navy: true,
    custom: true,
  })
  const [mapCenter, setMapCenter] = useState([24, 65])
  const [mapZoom, setMapZoom] = useState(() => {
    if (typeof window !== 'undefined') {
      const minDim = Math.min(window.innerWidth, window.innerHeight)
      if (minDim < 500) return 1.05
      if (minDim < 800) return 1.25
      return 1.45
    }
    return 1.45
  })

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light')
      document.body.classList.add('theme-light')
    } else {
      document.documentElement.classList.remove('theme-light')
      document.body.classList.remove('theme-light')
    }
    localStorage.setItem('defensebioscope_theme', theme)
  }, [theme])

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (next === 'light') {
        document.documentElement.classList.add('theme-light')
        document.body.classList.add('theme-light')
      } else {
        document.documentElement.classList.remove('theme-light')
        document.body.classList.remove('theme-light')
      }
      localStorage.setItem('defensebioscope_theme', next)
      return next
    })
  }, [])

  // Balanced country-diverse interleaving ("aula jhaula")
  // Ensures consecutive systems come from different countries (US, Russia, Pakistan, China, etc.)
  const mixedSystems = useMemo(() => {
    const byOrigin = {}
    for (const item of systemsData) {
      const origin = item.origin || 'Unknown'
      if (!byOrigin[origin]) byOrigin[origin] = []
      byOrigin[origin].push(item)
    }

    const origins = Object.keys(byOrigin).sort((a, b) => {
      let hashA = 0, hashB = 0
      for (let i = 0; i < a.length; i++) hashA = (hashA * 37 + a.charCodeAt(i)) & 0xffffffff
      for (let i = 0; i < b.length; i++) hashB = (hashB * 37 + b.charCodeAt(i)) & 0xffffffff
      return hashA - hashB
    })

    const result = []
    let hasMore = true
    let idx = 0
    while (hasMore) {
      hasMore = false
      for (const o of origins) {
        if (idx < byOrigin[o].length) {
          result.push(byOrigin[o][idx])
          hasMore = true
        }
      }
      idx++
    }
    return result
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoId = urlParams.get('demo'); // No default - don't place anything automatically on refresh
    if (demoId) {
      const demoSystem = systemsData.find(s => s.id === demoId || s.name.toLowerCase().includes(demoId.toLowerCase()));
      if (demoSystem) {
        setPlacedSystems([{
          id: `${demoSystem.id}-demo`,
          system: demoSystem,
          position: { lat: 40, lng: -100 },
          visible: true,
          detonated: true
        }]);
        setMapCenter([40, -100]);
        setMapZoom(4);
      }
    }
  }, []);

  const handleSelectSystem = useCallback((system) => {
    setSelectedSystem(system)
    setPlacingMode(true)
  }, [])

  const handleMapClick = useCallback((latlng) => {
    if (placingMode && selectedSystem) {
      const newPlacement = {
        id: `${selectedSystem.id}-${Date.now()}`,
        system: selectedSystem,
        position: latlng,
        visible: true,
      }
      setPlacedSystems(prev => [...prev, newPlacement])
      setPlacingMode(false)
      setSelectedSystem(null)
    }
  }, [placingMode, selectedSystem])

  const handleRemoveSystem = useCallback((placementId) => {
    setPlacedSystems(prev => prev.filter(p => p.id !== placementId))
  }, [])

  const handleClearAll = useCallback(() => {
    setPlacedSystems([])
  }, [])

  const handleToggleVisibility = useCallback((placementId) => {
    setPlacedSystems(prev =>
      prev.map(p =>
        p.id === placementId ? { ...p, visible: !p.visible } : p
      )
    )
  }, [])

  const handleToggleType = useCallback((type) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }, [])

  const handleAddCustomSystem = useCallback((customSystem) => {
    const system = {
      ...customSystem,
      id: `custom-${Date.now()}`,
      type: customSystem.type || 'custom',
    }
    setSelectedSystem(system)
    setPlacingMode(true)
  }, [])

  const handleGoToLocation = useCallback((lat, lng, zoom = 6) => {
    setMapCenter([lat, lng])
    setMapZoom(zoom)
  }, [])

  const handleMoveSystem = useCallback((id, newPosition) => {
    setPlacedSystems(prev => prev.map(p => p.id === id ? { ...p, position: newPosition } : p))
  }, [])

  const handleDetonateSystem = useCallback((id) => {
    setPlacedSystems(prev => prev.map(p => p.id === id ? { ...p, detonated: !p.detonated } : p))
  }, [])

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      {/* Top Bar */}
      <TopBar
        placingMode={placingMode}
        selectedSystem={selectedSystem}
        onCancelPlacing={() => { setPlacingMode(false); setSelectedSystem(null) }}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onToggleLayers={() => setLayerPanelOpen(prev => !prev)}
        sidebarOpen={sidebarOpen}
        onGoToLocation={handleGoToLocation}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <MapView
          placedSystems={placedSystems}
          visibleTypes={visibleTypes}
          onMapClick={handleMapClick}
          placingMode={placingMode}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMoveSystem={handleMoveSystem}
          onRemoveSystem={handleRemoveSystem}
          onDetonateSystem={handleDetonateSystem}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* Sidebar - Desktop */}
      <div className="desktop-only">
        <Sidebar
          systems={mixedSystems}
          onSelectSystem={handleSelectSystem}
          onAddCustom={handleAddCustomSystem}
          placedSystems={placedSystems}
          onRemoveSystem={handleRemoveSystem}
          onToggleVisibility={handleToggleVisibility}
          onClearAll={handleClearAll}
          isOpen={sidebarOpen}
          selectedSystem={selectedSystem}
        />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="mobile-only">
        <MobileSheet
          systems={mixedSystems}
          onSelectSystem={handleSelectSystem}
          onAddCustom={handleAddCustomSystem}
          placedSystems={placedSystems}
          onRemoveSystem={handleRemoveSystem}
          onToggleVisibility={handleToggleVisibility}
          onClearAll={handleClearAll}
          visibleTypes={visibleTypes}
          onToggleType={handleToggleType}
          selectedSystem={selectedSystem}
        />
      </div>
    </div>
  )
}

export default App

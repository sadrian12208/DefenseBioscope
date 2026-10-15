import { useRef, useCallback, useMemo, useEffect, useState } from 'react'
import Map, { Source, Layer, Marker, Popup, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  IconSun,
  IconMoon,
  IconCrosshair,
  IconPin,
  IconTrash,
  IconBlast,
  IconSpeed,
  Icon3DMissile,
  Icon3DAirDefense,
  Icon3DFighterJet,
  Icon3DDrone,
  Icon3DWarship,
  Icon3DCustom,
  IconCountryBadge,
  OriginDisplay,
  IconExternalLink,
  IconGlobe,
  IconMap,
  IconSwords,
  IconMilitaryBase,
  IconClose,
  Icon3DTank,
} from './Icons'
import {
  getInitialMilitaryBases,
  fetchBaseLiveWiki,
  scanLiveWikiBasesInViewport,
} from '../services/militaryBasesService'

const TYPE_COLORS = {
  sam: '#06b6d4',
  missile: '#ef4444',
  aircraft: '#a855f7',
  drone: '#10b981',
  navy: '#3b82f6',
  tank: '#10b981',
  custom: '#10b981',
}

const TYPE_LABELS = {
  sam: 'Air Defense',
  missile: 'Missile',
  aircraft: 'Aircraft',
  drone: 'Drone / UAV',
  navy: 'Navy / Ship',
  tank: 'Tank / Armor',
  custom: 'Custom',
}

function renderTypeIcon(type, className = 'w-6 h-6') {
  switch (type) {
    case 'sam':
      return <Icon3DAirDefense className={className} />
    case 'missile':
      return <Icon3DMissile className={className} />
    case 'aircraft':
      return <Icon3DFighterJet className={className} />
    case 'drone':
      return <Icon3DDrone className={className} />
    case 'navy':
      return <Icon3DWarship className={className} />
    case 'tank':
      return <Icon3DTank className={className} />
    case 'custom':
    default:
      return <Icon3DCustom className={className} />
  }
}

function createCircleCoords(center, radiusKm, steps = 80, isFlat = false) {
  const coords = []
  const R = 6371
  const latDelta = (radiusKm / R) * (180 / Math.PI)
  const cosLat = Math.cos((center[1] * Math.PI) / 180)
  // In flat earth mode, user requested: "just circle holei hobe, omon curv er dorkar nai"
  const lngDelta = isFlat ? latDelta : (Math.abs(cosLat) > 0.05 ? latDelta / cosLat : latDelta)
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const lat = Math.max(-85, Math.min(85, center[1] + latDelta * Math.sin(angle)))
    const lng = center[0] + lngDelta * Math.cos(angle)
    coords.push([lng, lat])
  }
  return coords
}

function formatArea(km) {
  const a = Math.PI * km * km
  if (a > 1e6) return `${(a / 1e6).toFixed(2)}M km²`
  if (a > 1e3) return `${(a / 1e3).toFixed(1)}K km²`
  return `${a.toFixed(0)} km²`
}

function formatRange(km) {
  return km >= 1000 ? `${(km / 1000).toFixed(1)}K km` : `${km} km`
}

const DARK_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const LIGHT_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'

function ensurePinIcon(map) {
  if (!map || map.hasImage('location-pin-icon')) return
  try {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Sharp teardrop location pin with inner hole (SDF compatible)
    const pin = new Path2D(
      'M16 2 C10.48 2 6 6.48 6 12 C6 19.5 16 30 16 30 C16 30 26 19.5 26 12 C26 6.48 21.52 2 16 2 Z'
    )
    pin.arc(16, 12, 3.5, 0, Math.PI * 2)

    ctx.fillStyle = '#ffffff'
    ctx.fill(pin, 'evenodd')

    const imgData = ctx.getImageData(0, 0, size, size)
    map.addImage('location-pin-icon', imgData, { sdf: true })
  } catch {}
}

export default function MapView({
  placedSystems,
  visibleTypes,
  onMapClick,
  placingMode,
  mapCenter,
  mapZoom,
  onMoveSystem,
  onRemoveSystem,
  onDetonateSystem,
  theme = 'dark',
  onToggleTheme,
}) {
  const mapRef = useRef(null)
  const [selectedPlacementId, setSelectedPlacementId] = useState(null)
  const [popupAnchor, setPopupAnchor] = useState('bottom')
  const [cursor, setCursor] = useState(null)
  const [isFlat, setIsFlat] = useState(false)

  // Global Military Bases Layer (Live Wikipedia ⚔)
  const [showMilitaryBases, setShowMilitaryBases] = useState(false)
  const [militaryBases, setMilitaryBases] = useState(() => {
    const initial = getInitialMilitaryBases()
    try {
      const stored = localStorage.getItem('defensebioscope_live_discovered_bases')
      if (stored) {
        const extra = JSON.parse(stored)
        if (Array.isArray(extra) && extra.length > 0) {
          const existingIds = new Set(initial.map((b) => b.id))
          const existingNames = new Set(initial.map((b) => b.name.toLowerCase()))
          for (const item of extra) {
            if (!existingIds.has(item.id) && !existingNames.has(item.name.toLowerCase())) {
              initial.push(item)
            }
          }
        }
      }
    } catch {}
    return initial
  })
  const [militaryStatusFilter, setMilitaryStatusFilter] = useState('all')
  const [selectedMilitaryBase, setSelectedMilitaryBase] = useState(null)
  const [baseLiveWiki, setBaseLiveWiki] = useState(null)
  const [isLoadingBaseWiki, setIsLoadingBaseWiki] = useState(false)
  const [isScanningBases, setIsScanningBases] = useState(false)

  // Silent Real-Time Wikipedia Auto-Discovery Engine (Works in 2027, 2030, 2050 forever)
  const scannedCoordsRef = useRef(new Set())
  const autoScanTimerRef = useRef(null)

  const scanCurrentViewport = useCallback(async () => {
    if (!showMilitaryBases || !mapRef.current) return
    try {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      if (!map) return

      const center = map.getCenter()
      const zoom = map.getZoom()
      if (zoom < 3.0) return // Focus on regional or country scale

      const coordKey = `${center.lat.toFixed(1)}_${center.lng.toFixed(1)}`
      if (scannedCoordsRef.current.has(coordKey)) return
      scannedCoordsRef.current.add(coordKey)

      if (scannedCoordsRef.current.size > 250) {
        scannedCoordsRef.current.clear()
        scannedCoordsRef.current.add(coordKey)
      }

      setIsScanningBases(true)
      const discovered = await scanLiveWikiBasesInViewport(center.lat, center.lng, 10)
      setIsScanningBases(false)

      if (!discovered || discovered.length === 0) return

      setMilitaryBases((prev) => {
        const existingNames = new Set(prev.map((b) => b.name.toLowerCase()))
        const existingWiki = new Set(prev.map((b) => (b.wiki_title || '').toLowerCase()))
        const newItems = []

        for (const base of discovered) {
          const nameLower = base.name.toLowerCase()
          const wikiLower = (base.wiki_title || '').toLowerCase()

          const isNearby = prev.some((b) => {
            const dLat = Math.abs(b.lat - base.lat)
            const dLng = Math.abs(b.lng - base.lng)
            return dLat < 0.025 && dLng < 0.025
          })

          if (!existingNames.has(nameLower) && !existingWiki.has(wikiLower) && !isNearby) {
            newItems.push(base)
            existingNames.add(nameLower)
          }
        }

        if (newItems.length === 0) return prev

        const updated = [...prev, ...newItems]
        try {
          const stored = localStorage.getItem('defensebioscope_live_discovered_bases')
          const prevStored = stored ? JSON.parse(stored) : []
          const combined = [...prevStored, ...newItems]
          localStorage.setItem('defensebioscope_live_discovered_bases', JSON.stringify(combined.slice(-300)))
        } catch {}

        return updated
      })
    } catch {
      setIsScanningBases(false)
    }
  }, [showMilitaryBases])

  useEffect(() => {
    if (!showMilitaryBases) return
    if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current)
    autoScanTimerRef.current = setTimeout(scanCurrentViewport, 900)
    return () => {
      if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current)
    }
  }, [showMilitaryBases, scanCurrentViewport])

  const filteredBases = useMemo(() => {
    if (militaryStatusFilter === 'all') return militaryBases
    return militaryBases.filter((b) => b.status === militaryStatusFilter)
  }, [militaryBases, militaryStatusFilter])

  const baseCounts = useMemo(() => {
    const counts = { all: militaryBases.length, active: 0, temporary: 0, decommissioned: 0 }
    for (const b of militaryBases) {
      const s = b.status || 'active'
      if (counts[s] !== undefined) counts[s]++
      else counts.active++
    }
    return counts
  }, [militaryBases])

  const basesGeoJson = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: filteredBases.map((b) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [b.lng, b.lat] },
        properties: {
          id: b.id,
          status: b.status || 'active',
          name: b.name,
          country: b.country,
          wiki_title: b.wiki_title || '',
          command: b.command || b.operator || '',
          operator: b.operator || '',
          type: b.type || '',
          category: b.category || '',
          summary: b.summary || '',
          wiki_url: b.wiki_url || '',
          lat: b.lat,
          lng: b.lng,
        },
      })),
    }),
    [filteredBases]
  )

  // Derive active placement in real time from placedSystems so dragging keeps marker & popup 100% in sync
  const activePlacement = useMemo(
    () => placedSystems.find((p) => p.id === selectedPlacementId) || null,
    [placedSystems, selectedPlacementId]
  )

  // Dynamic anchor solver ensuring popup card is 100% visible regardless of globe position or zoom
  const updateAnchorForPoint = useCallback((lng, lat) => {
    if (!mapRef.current) return
    try {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      if (!map) return
      const point = map.project([lng, lat])
      const container = map.getContainer()
      const w = container.clientWidth
      const h = container.clientHeight

      // Top navbar takes 55-60px. Opening upwards requires ~280px above the point.
      // If marker is in upper 52% of screen (or <360px from top), anchor='top' (popup opens downwards into spacious area).
      // If marker is in lower 48% of screen, anchor='bottom' (popup opens upwards safely).
      let vertical = point.y < Math.max(340, h * 0.52) ? 'top' : 'bottom'
      let horizontal = ''
      if (point.x > w * 0.65) horizontal = '-right'
      else if (point.x < w * 0.35) horizontal = '-left'
      setPopupAnchor(vertical + horizontal)
    } catch {}
  }, [])

  // Nudge map slightly if selected point is too close to screen edges (e.g. behind header)
  const ensurePointInSafeBounds = useCallback((lng, lat) => {
    if (!mapRef.current) return
    try {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      if (!map) return
      const point = map.project([lng, lat])
      const container = map.getContainer()
      const w = container.clientWidth
      const h = container.clientHeight

      let panX = 0
      let panY = 0

      // Top edge safety: navbar is 60px; ensure point has comfortable space
      if (point.y < 120) {
        panY = point.y - 140
      } else if (point.y > h - 120) {
        panY = point.y - (h - 140)
      }

      if (point.x < 150) {
        panX = point.x - 170
      } else if (point.x > w - 150) {
        panX = point.x - (w - 170)
      }

      if (panX !== 0 || panY !== 0) {
        map.panBy([panX, panY], { duration: 350 })
      }
    } catch {}
  }, [])

  // Pre-cache both map style JSONs in browser HTTP cache for instant switching
  useEffect(() => {
    fetch(DARK_STYLE_URL, { cache: 'force-cache' }).catch(() => {})
    fetch(LIGHT_STYLE_URL, { cache: 'force-cache' }).catch(() => {})
  }, [])

  // Toggle between 3D Globe and 2D Flat Earth Map
  const handleToggleFlat = useCallback(() => {
    setIsFlat((prev) => {
      const next = !prev
      if (mapRef.current) {
        const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
        try {
          if (next) {
            map.setProjection({ type: 'mercator' })
            map.easeTo({ pitch: 0, bearing: 0, duration: 800 })
          } else {
            map.setProjection({ type: 'globe' })
            map.easeTo({ pitch: 0, bearing: 0, duration: 800 })
          }
        } catch (e) {
          // Projection toggle handled silently
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [mapCenter[1], mapCenter[0]],
        zoom: mapZoom,
        duration: 2000,
        essential: true,
      })
    }
  }, [mapCenter, mapZoom])

  const handleSelectMilitaryBase = useCallback(
    async (base) => {
      setSelectedMilitaryBase(base)
      setSelectedPlacementId(null)
      updateAnchorForPoint(base.lng, base.lat)
      ensurePointInSafeBounds(base.lng, base.lat)
      setBaseLiveWiki(null)
      setIsLoadingBaseWiki(true)

      try {
        const liveData = await fetchBaseLiveWiki(base.wiki_title || base.name)
        setBaseLiveWiki(liveData)
      } catch {
        // Fallback silently
      } finally {
        setIsLoadingBaseWiki(false)
      }
    },
    [updateAnchorForPoint, ensurePointInSafeBounds]
  )

  const handleScanViewportBases = useCallback(async () => {
    if (!mapRef.current) return
    setIsScanningBases(true)
    try {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      const center = map.getCenter()
      const newBases = await scanLiveWikiBasesInViewport(center.lat, center.lng, 25)
      if (newBases && newBases.length > 0) {
        setMilitaryBases((prev) => {
          const existingIds = new Set(prev.map((b) => b.id))
          const additions = newBases.filter((b) => !existingIds.has(b.id))
          return [...prev, ...additions]
        })
      }
    } catch {
      // Handled silently
    } finally {
      setIsScanningBases(false)
    }
  }, [])

  const handleClick = useCallback(
    (e) => {
      // Check if a military base feature was clicked on the native WebGL layer
      if (showMilitaryBases && e.features && e.features.length > 0) {
        const baseFeature = e.features.find(
          (f) => f.layer.id === 'military-bases-symbol' || f.layer.id === 'military-bases-circle'
        )
        if (baseFeature) {
          const baseId = baseFeature.properties?.id
          const matched = militaryBases.find((b) => b.id === baseId)
          if (matched) {
            handleSelectMilitaryBase(matched)
            return
          } else if (baseFeature.properties) {
            handleSelectMilitaryBase({
              ...baseFeature.properties,
              lat: Number(baseFeature.properties.lat),
              lng: Number(baseFeature.properties.lng),
            })
            return
          }
        }
      }

      setSelectedMilitaryBase(null)
      if (placingMode) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      }
    },
    [showMilitaryBases, militaryBases, handleSelectMilitaryBase, placingMode, onMapClick]
  )

  const handleMouseMove = useCallback(
    (e) => {
      if (placingMode) {
        setCursor({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      }
    },
    [placingMode]
  )

  const visiblePlacements = useMemo(
    () => placedSystems.filter((p) => p.visible && (visibleTypes[p.system.type] ?? true)),
    [placedSystems, visibleTypes]
  )

  const circleData = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: visiblePlacements.flatMap((p) => {
        const center = [p.position.lng, p.position.lat]
        const color = TYPE_COLORS[p.system.type] || TYPE_COLORS.custom
        return [
          {
            type: 'Feature',
            properties: { color, opacity: 0.16, id: p.id },
            geometry: {
              type: 'Polygon',
              coordinates: [createCircleCoords(center, p.system.range_km, 80, isFlat)],
            },
          },
          {
            type: 'Feature',
            properties: { color, opacity: 0.26, id: p.id + '-inner' },
            geometry: {
              type: 'Polygon',
              coordinates: [createCircleCoords(center, p.system.range_km * 0.5, 80, isFlat)],
            },
          },
        ]
      }),
    }),
    [visiblePlacements, isFlat]
  )

  const lineData = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: visiblePlacements.map((p) => {
        const center = [p.position.lng, p.position.lat]
        const color = TYPE_COLORS[p.system.type] || TYPE_COLORS.custom
        return {
          type: 'Feature',
          properties: { color, id: p.id },
          geometry: {
            type: 'LineString',
            coordinates: createCircleCoords(center, p.system.range_km, 80, isFlat),
          },
        }
      }),
    }),
    [visiblePlacements, isFlat]
  )

  const themeRef = useRef(theme)
  themeRef.current = theme
  const isFlatRef = useRef(isFlat)
  isFlatRef.current = isFlat

  const applyMapStyles = useCallback((map) => {
    if (!map) return
    ensurePinIcon(map)
    const currentTheme = themeRef.current
    const currentFlat = isFlatRef.current

    try {
      map.setProjection({ type: currentFlat ? 'mercator' : 'globe' })
    } catch {}

    try {
      if (map.getLayer('water')) {
        if (currentTheme === 'light') {
          // Slightly more blue as requested, beautiful and natural sea blue tone
          map.setPaintProperty('water', 'fill-color', '#9ec9e8')
        } else {
          // Authentic Carto Dark Matter lighter slate/gray ocean tone ("sada type")
          map.setPaintProperty('water', 'fill-color', '#2c353c')
        }
      }
      if (map.getLayer('water_shadow')) {
        map.setPaintProperty('water_shadow', 'fill-color', 'transparent')
      }
    } catch {}

    // Style country, state, and administrative borders - thin ("chikon") yet bright and clearly visible ("valoi ujjol & clear")
    try {
      const style = map.getStyle()
      if (style && style.layers) {
        style.layers.forEach((l) => {
          if (l.type === 'line') {
            const id = l.id.toLowerCase()
            if (id.includes('boundary') || id.includes('border') || id.includes('country') || id.includes('waterway')) {
              if (currentTheme === 'light') {
                if (id.includes('country_outline')) {
                  map.setPaintProperty(l.id, 'line-color', '#64748b')
                  map.setPaintProperty(l.id, 'line-width', 0.6)
                  map.setPaintProperty(l.id, 'line-opacity', 0.3)
                } else if (id.includes('country')) {
                  // Subtly toned down as requested: slightly softer without glaring
                  map.setPaintProperty(l.id, 'line-color', '#64748b')
                  map.setPaintProperty(l.id, 'line-width', 0.65)
                  map.setPaintProperty(l.id, 'line-opacity', 0.55)
                } else {
                  map.setPaintProperty(l.id, 'line-color', '#94a3b8')
                  map.setPaintProperty(l.id, 'line-width', 0.35)
                  map.setPaintProperty(l.id, 'line-opacity', 0.4)
                }
              } else {
                // Dark mode: thin, sleek, distinct border with balanced brightness (not overly glaring)
                if (id.includes('country_outline')) {
                  map.setPaintProperty(l.id, 'line-color', '#64748b')
                  map.setPaintProperty(l.id, 'line-width', 0.45)
                  map.setPaintProperty(l.id, 'line-opacity', 0.2)
                } else if (id.includes('country')) {
                  // Subtly reduced brightness from 0.95 to 0.68 and #e2e8f0 to #cbd5e1
                  map.setPaintProperty(l.id, 'line-color', '#cbd5e1')
                  map.setPaintProperty(l.id, 'line-width', 0.75)
                  map.setPaintProperty(l.id, 'line-opacity', 0.68)
                } else {
                  map.setPaintProperty(l.id, 'line-color', '#475569')
                  map.setPaintProperty(l.id, 'line-width', 0.35)
                  map.setPaintProperty(l.id, 'line-opacity', 0.35)
                }
              }
            }
          }
        })
      }
    } catch (e) {
      // Border styling handled silently
    }

    try {
      if (currentTheme === 'dark') {
        map.setSky({
          'sky-color': '#0a0e1a',
          'sky-horizon-blend': 0.5,
          'horizon-color': '#111833',
          'horizon-fog-blend': 0.8,
          'fog-color': '#0a0e1a',
          'fog-ground-blend': 0.9,
        })
      } else {
        map.setSky({
          'sky-color': '#3b82f6',
          'sky-horizon-blend': 0.5,
          'horizon-color': '#93c5fd',
          'horizon-fog-blend': 0.6,
          'fog-color': '#bfdbfe',
          'fog-ground-blend': 0.7,
        })
      }
    } catch {}
  }, [])

  const handleMapLoad = useCallback((e) => {
    const map = e.target
    ensurePinIcon(map)
    applyMapStyles(map)

    map.on('style.load', () => {
      ensurePinIcon(map)
      applyMapStyles(map)
    })
  }, [applyMapStyles])

  // Ensure theme or flat toggle immediately updates ocean color, borders, and projection
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap ? mapRef.current.getMap() : mapRef.current
      if (map && map.isStyleLoaded()) {
        ensurePinIcon(map)
        applyMapStyles(map)
      }
    }
  }, [theme, isFlat, applyMapStyles])

  return (
    <div
      className="absolute inset-0 z-0"
      id="map-container"
      style={{ background: 'var(--bg-main)' }}
    >
      <div className="w-full h-full">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: mapCenter[1],
            latitude: mapCenter[0],
            zoom: mapZoom,
            pitch: 0,
            bearing: 0,
          }}
          projection={isFlat ? 'mercator' : 'globe'}
          padding={{ top: 55, bottom: 15, left: 0, right: 0 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={theme === 'dark' ? DARK_STYLE_URL : LIGHT_STYLE_URL}
          interactiveLayerIds={showMilitaryBases ? ['military-bases-symbol'] : undefined}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseEnter={(e) => {
            if (e.features && e.features.length > 0) {
              const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current
              if (map) map.getCanvas().style.cursor = 'pointer'
            }
          }}
          onMouseLeave={() => {
            const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current
            if (map) map.getCanvas().style.cursor = placingMode ? 'crosshair' : ''
          }}
          onMove={() => {
            if (activePlacement) {
              updateAnchorForPoint(activePlacement.position.lng, activePlacement.position.lat)
            } else if (selectedMilitaryBase) {
              updateAnchorForPoint(selectedMilitaryBase.lng, selectedMilitaryBase.lat)
            }
          }}
          onMoveEnd={() => {
            if (showMilitaryBases) {
              if (autoScanTimerRef.current) clearTimeout(autoScanTimerRef.current)
              autoScanTimerRef.current = setTimeout(scanCurrentViewport, 700)
            }
          }}
          cursor={placingMode ? 'crosshair' : undefined}
          onLoad={handleMapLoad}
          antialias={true}
          maxPitch={85}
          minZoom={0.9}
          maxZoom={18}
          dragRotate={true}
        >
          {/* Coverage fill */}
          <Source id="circles" type="geojson" data={circleData}>
            <Layer
              id="circle-fill"
              type="fill"
              paint={{
                'fill-color': ['get', 'color'],
                'fill-opacity': ['get', 'opacity'],
              }}
            />
          </Source>

          {/* Deep, High-Contrast Coverage Border */}
          <Source id="lines" type="geojson" data={lineData}>
            <Layer
              id="circle-line"
              type="line"
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 2.8,
                'line-opacity': 0.95,
              }}
            />
          </Source>

          {/* Blast radius visualization if detonated */}
          {visiblePlacements.map((p) => {
            if (!p.detonated) return null
            const isBigNuke = p.system.range_km >= 5000
            const isMediumMissile = p.system.range_km >= 500 && p.system.range_km < 5000

            const heavyDamageRad = isBigNuke ? 8 : isMediumMissile ? 2.5 : 0.6
            const thermalRad = isBigNuke ? 18 : isMediumMissile ? 6 : 1.5
            const lightDamageRad = isBigNuke ? 30 : isMediumMissile ? 12 : 3

            const center = [p.position.lng, p.position.lat]

            const blastFeatures = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { color: '#ef4444', opacity: 0.35 },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [createCircleCoords(center, heavyDamageRad, 80, isFlat)],
                  },
                },
                {
                  type: 'Feature',
                  properties: { color: '#f59e0b', opacity: 0.2 },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [createCircleCoords(center, thermalRad, 80, isFlat)],
                  },
                },
                {
                  type: 'Feature',
                  properties: { color: '#eab308', opacity: 0.1 },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [createCircleCoords(center, lightDamageRad, 80, isFlat)],
                  },
                },
              ],
            }

            const blastLineFeatures = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { color: '#ef4444' },
                  geometry: {
                    type: 'LineString',
                    coordinates: createCircleCoords(center, heavyDamageRad, 80, isFlat),
                  },
                },
                {
                  type: 'Feature',
                  properties: { color: '#f59e0b' },
                  geometry: {
                    type: 'LineString',
                    coordinates: createCircleCoords(center, thermalRad, 80, isFlat),
                  },
                },
                {
                  type: 'Feature',
                  properties: { color: '#eab308' },
                  geometry: {
                    type: 'LineString',
                    coordinates: createCircleCoords(center, lightDamageRad, 80, isFlat),
                  },
                },
              ],
            }

            return (
              <div key={`blast-${p.id}`}>
                <Source id={`blast-src-${p.id}`} type="geojson" data={blastFeatures}>
                  <Layer
                    id={`blast-lyr-${p.id}`}
                    type="fill"
                    paint={{
                      'fill-color': ['get', 'color'],
                      'fill-opacity': ['get', 'opacity'],
                    }}
                  />
                </Source>
                <Source id={`blast-line-src-${p.id}`} type="geojson" data={blastLineFeatures}>
                  <Layer
                    id={`blast-line-lyr-${p.id}`}
                    type="line"
                    paint={{
                      'line-color': ['get', 'color'],
                      'line-width': 2,
                      'line-opacity': 0.85,
                    }}
                  />
                </Source>
              </div>
            )
          })}

          {/* Markers */}
          {visiblePlacements.map((p) => {
            const color = TYPE_COLORS[p.system.type] || TYPE_COLORS.custom
            return (
              <Marker
                key={p.id}
                longitude={p.position.lng}
                latitude={p.position.lat}
                anchor="center"
                draggable={true}
                onDrag={(e) => onMoveSystem(p.id, { lat: e.lngLat.lat, lng: e.lngLat.lng })}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelectedPlacementId(p.id)
                  updateAnchorForPoint(p.position.lng, p.position.lat)
                  try {
                    const map = mapRef.current?.getMap ? mapRef.current.getMap() : mapRef.current
                    if (map) {
                      const point = map.project([p.position.lng, p.position.lat])
                      const container = map.getContainer()
                      const w = container.clientWidth
                      const h = container.clientHeight

                      // If clicked too high, too low, or too close to side edges, gently nudge map so full card is visible
                      let panX = 0
                      let panY = 0
                      if (point.y < 160) panY = -(180 - point.y)
                      else if (point.y > h - 160) panY = point.y - (h - 180)
                      if (point.x < 160) panX = -(180 - point.x)
                      else if (point.x > w - 160) panX = point.x - (w - 180)

                      if (panX !== 0 || panY !== 0) {
                        map.panBy([panX, panY], { duration: 300 })
                      }
                    }
                  } catch {}
                }}
              >
                <div className="relative group cursor-pointer">
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-white/90 shadow-md ${p.detonated ? 'animate-pulse' : ''
                      }`}
                    style={{
                      background: p.detonated
                        ? 'radial-gradient(circle at 35% 35%, #ef2828ff, #930c0cff)'
                        : `radial-gradient(circle at 35% 35%, ${color}, ${color}99)`,
                    }}
                  />
                  <div
                    className={`absolute inset-[-4px] rounded-full border ${p.detonated ? 'border-red-500/60' : 'border-white/20'
                      }`}
                  />
                  {p.detonated && (
                    <div className="absolute top-[-22px] left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap tracking-wider uppercase border border-white/30">
                      DETONATED
                    </div>
                  )}
                </div>
              </Marker>
            )
          })}

          {/* Global Military Bases — GPU-accelerated native MapLibre Layer (Location Pin Icons) */}
          {showMilitaryBases && (
            <Source id="military-bases-src" type="geojson" data={basesGeoJson}>
              <Layer
                id="military-bases-symbol"
                type="symbol"
                layout={{
                  'icon-image': 'location-pin-icon',
                  'icon-size': [
                    'interpolate', ['linear'], ['zoom'],
                    1, 0.45,
                    3, 0.58,
                    6, 0.78,
                    9, 1.0,
                    12, 1.25,
                  ],
                  'icon-anchor': 'bottom',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                }}
                paint={{
                  'icon-color': [
                    'match', ['get', 'status'],
                    'decommissioned', '#fb7185',
                    'temporary', '#fbbf24',
                    '#34d399',
                  ],
                  'icon-halo-color': [
                    'case',
                    ['==', ['get', 'id'], selectedMilitaryBase?.id || ''],
                    '#ffffff',
                    '#0b1120',
                  ],
                  'icon-halo-width': [
                    'case',
                    ['==', ['get', 'id'], selectedMilitaryBase?.id || ''],
                    2.5,
                    1.2,
                  ],
                }}
              />
            </Source>
          )}

          {/* MapLibre 3D Pitch/Bearing Navigation Control (Interactive Compass Needle) */}
          <NavigationControl position="bottom-right" visualizePitch={true} />

          {/* Tactical Weapon Description Popup (100% synchronized with marker position during drag) */}
          {activePlacement && (
            <Popup
              longitude={activePlacement.position.lng}
              latitude={activePlacement.position.lat}
              anchor={popupAnchor}
              offset={14}
              onClose={() => setSelectedPlacementId(null)}
              closeButton={false}
              closeOnClick={false}
              className="system-popup-gl"
              maxWidth="310px"
            >
              <PopupContent
                placement={activePlacement}
                onClose={() => setSelectedPlacementId(null)}
                onRemove={() => {
                  onRemoveSystem(activePlacement.id)
                  setSelectedPlacementId(null)
                }}
                onDetonate={() => {
                  onDetonateSystem(activePlacement.id)
                }}
              />
            </Popup>
          )}

          {/* Military Base Live Wikipedia Intelligence Popup */}
          {selectedMilitaryBase && (
            <Popup
              longitude={selectedMilitaryBase.lng}
              latitude={selectedMilitaryBase.lat}
              anchor={popupAnchor}
              offset={14}
              onClose={() => setSelectedMilitaryBase(null)}
              closeButton={false}
              closeOnClick={false}
              className="system-popup-gl"
              maxWidth="330px"
            >
              <MilitaryBasePopupContent
                base={selectedMilitaryBase}
                liveWiki={baseLiveWiki}
                loading={isLoadingBaseWiki}
                onClose={() => setSelectedMilitaryBase(null)}
              />
            </Popup>
          )}
        </Map>
      </div>

      {/* Floating Tactical Controls: Military Bases, Flat Earth & Theme Toggle Buttons */}
      <div className="map-floating-controls">
        {/* Status Filter Buttons (2 Tiers: All & Active on top, Temp & Closed directly below) */}
        {showMilitaryBases && (
          <div className="flex flex-col gap-1 mb-1.5 select-none items-end">
            {/* Tier 1: All & Active side-by-side */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMilitaryStatusFilter('all')}
                className={`px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 border rounded-none min-w-[92px] ${
                  militaryStatusFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-emerald-500/25'
                    : 'bg-slate-950/90 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white backdrop-blur-md'
                }`}
                title="Show all military bases"
              >
                <span>All</span>
                <span
                  className={`text-[9px] px-1 py-0.2 font-mono ${
                    militaryStatusFilter === 'all'
                      ? 'bg-slate-950/25 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {baseCounts.all}
                </span>
              </button>
              <button
                onClick={() => setMilitaryStatusFilter('active')}
                className={`px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 border rounded-none min-w-[92px] ${
                  militaryStatusFilter === 'active'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-emerald-500/25'
                    : 'bg-slate-950/90 text-emerald-400 border-emerald-500/40 hover:border-emerald-400 hover:text-emerald-300 backdrop-blur-md'
                }`}
                title="Show operational active bases"
              >
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Active</span>
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 font-mono ${
                    militaryStatusFilter === 'active'
                      ? 'bg-slate-950/25 text-slate-950 font-black'
                      : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  {baseCounts.active}
                </span>
              </button>
            </div>

            {/* Tier 2: Temp & Closed right below */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMilitaryStatusFilter('temporary')}
                className={`px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 border rounded-none min-w-[92px] ${
                  militaryStatusFilter === 'temporary'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/25'
                    : 'bg-slate-950/90 text-amber-400 border-amber-500/40 hover:border-amber-400 hover:text-amber-300 backdrop-blur-md'
                }`}
                title="Show forward operating & temporary bases"
              >
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  <span>Temp</span>
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 font-mono ${
                    militaryStatusFilter === 'temporary'
                      ? 'bg-slate-950/25 text-slate-950 font-black'
                      : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {baseCounts.temporary}
                </span>
              </button>
              <button
                onClick={() => setMilitaryStatusFilter('decommissioned')}
                className={`px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer shadow-md flex items-center justify-between gap-1.5 border rounded-none min-w-[92px] ${
                  militaryStatusFilter === 'decommissioned'
                    ? 'bg-rose-500 text-slate-950 border-rose-400 font-extrabold shadow-rose-500/25'
                    : 'bg-slate-950/90 text-rose-400 border-rose-500/40 hover:border-rose-400 hover:text-rose-300 backdrop-blur-md'
                }`}
                title="Show closed / historic / decommissioned bases"
              >
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                  <span>Closed</span>
                </span>
                <span
                  className={`text-[9px] px-1 py-0.2 font-mono ${
                    militaryStatusFilter === 'decommissioned'
                      ? 'bg-slate-950/25 text-slate-950 font-black'
                      : 'bg-slate-800 text-rose-400'
                  }`}
                >
                  {baseCounts.decommissioned}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Global Military Bases Layer Toggle (Location Pin Icon 📍) */}
        <button
          onClick={() => {
            setShowMilitaryBases((prev) => {
              const next = !prev
              if (!next) setSelectedMilitaryBase(null)
              return next
            })
          }}
          className={`nm-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all relative ${
            showMilitaryBases
              ? 'nm-btn-active text-emerald-400 border border-emerald-500/60 shadow-emerald-500/30 shadow-md'
              : 'text-text-primary hover:text-white'
          }`}
          title={showMilitaryBases ? 'Hide Global Military Bases' : 'Show Global Military Bases (Location Markers)'}
          aria-label="Toggle Global Military Bases"
        >
          <IconPin className={`w-4 h-4 ${showMilitaryBases ? 'text-emerald-400' : 'text-slate-300'}`} />
          {isScanningBases && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-ping" />
          )}
        </button>

        {/* Flat Earth / 3D Globe Projection Toggle */}
        <button
          onClick={handleToggleFlat}
          className={`nm-btn w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            isFlat ? 'nm-btn-active text-white' : 'text-accent-blue hover:text-white'
          }`}
          title={isFlat ? 'Switch to 3D Globe Projection' : 'Switch to 2D Flat Earth Map'}
          aria-label="Toggle Flat Map Projection"
        >
          {isFlat ? <IconGlobe className="w-4 h-4 text-white" /> : <IconMap className="w-4 h-4 text-accent-blue" />}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="nm-btn w-9 h-9 rounded-lg text-text-primary hover:text-white flex items-center justify-center"
          title={`Toggle Map Theme (${theme === 'dark' ? 'Light' : 'Dark'})`}
          aria-label="Toggle Map Theme"
        >
          {theme === 'dark' ? (
            <IconSun className="w-4 h-4 text-amber-400" />
          ) : (
            <IconMoon className="w-4 h-4 text-blue-500" />
          )}
        </button>
      </div>

      {/* Placing mode coordinate indicator */}
      {placingMode && cursor && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[1002] px-3.5 py-1.5 rounded-xl nm-card border-accent-blue/40 text-xs font-mono text-text-primary shadow-lg flex items-center gap-1.5">
          <IconPin className="w-3.5 h-3.5 text-accent-blue" />
          <span>
            {cursor.lat.toFixed(4)}°, {cursor.lng.toFixed(4)}°
          </span>
        </div>
      )}
    </div>
  )
}

function PopupContent({ placement, onRemove, onDetonate, onClose }) {
  const { system, position, detonated } = placement
  const color = TYPE_COLORS[system.type] || TYPE_COLORS.custom
  const speed = system.specs?.speed
  const payload = system.specs?.payload
  const manufacturer = system.specs?.manufacturer
  const breakdown = system.range_breakdown

  const isBigNuke = system.range_km >= 5000
  const isMediumMissile = system.range_km >= 500 && system.range_km < 5000
  const heavyDamageRad = isBigNuke ? 8 : isMediumMissile ? 2.5 : 0.6
  const thermalRad = isBigNuke ? 18 : isMediumMissile ? 6 : 1.5
  const lightDamageRad = isBigNuke ? 30 : isMediumMissile ? 12 : 3

  return (
    <div className="w-full flex flex-col p-2.5 gap-2 select-text overflow-hidden rounded-none">
      {/* Header: Type, Wiki, Close button */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-bold tracking-wide uppercase shrink-0"
            style={{
              background: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {renderTypeIcon(system.type, 'w-3 h-3')}
            <span>{TYPE_LABELS[system.type] || 'System'}</span>
          </span>
          {system.isWiki && (
            <span className="text-[8px] font-extrabold px-1 py-0.5 rounded-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              WIKI
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-none nm-btn text-text-muted hover:text-text-primary shrink-0 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <IconClose className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Title & Origin */}
      <div>
        <div className="text-xs font-extrabold panel-title leading-snug truncate" title={system.name}>
          {system.name}
        </div>
        {system.origin && (
          <div className="text-[10px] panel-sub mt-0.5 flex items-center gap-1 font-medium truncate">
            <OriginDisplay origin={system.origin} flagClass="text-xs shrink-0" textClass="font-semibold" />
            {manufacturer ? <span className="truncate text-text-muted">• {manufacturer}</span> : null}
          </div>
        )}
      </div>

      {/* Primary Metrics: Range & Coverage in 2 clean compact square boxes */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="nm-input px-2 py-1 rounded-none">
          <div className="text-[8px] text-text-muted uppercase font-semibold leading-none">Range</div>
          <div className="text-xs font-bold font-mono leading-tight mt-0.5" style={{ color }}>
            {formatRange(system.range_km)}
          </div>
        </div>
        <div className="nm-input px-2 py-1 rounded-none">
          <div className="text-[8px] text-text-muted uppercase font-semibold leading-none">Coverage</div>
          <div className="text-xs font-bold font-mono leading-tight mt-0.5 text-text-primary">
            {formatArea(system.range_km)}
          </div>
        </div>
      </div>

      {/* Extra Specs 1-liner (Combat Radius / Speed / Payload) if available */}
      {(breakdown?.combat_km || speed || payload) && (
        <div className="nm-card px-2 py-1 rounded-none text-[9px] flex items-center justify-between gap-1 text-text-secondary overflow-hidden whitespace-nowrap">
          {breakdown?.combat_km && (
            <span className="text-cyan-400 font-mono">Combat: {breakdown.combat_km}km</span>
          )}
          {speed && (
            <span className="text-amber-400 truncate font-medium">Spd: {speed}</span>
          )}
          {payload && (
            <span className="text-red-400 truncate font-medium">Pay: {payload}</span>
          )}
        </div>
      )}

      {/* Blast Impact Zones: 3 Horizontal Columns */}
      <div className="nm-input p-1.5 rounded-none border border-red-500/20">
        <div className="text-[8px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1 mb-1 leading-none">
          <IconBlast className="w-2.5 h-2.5 text-red-400" />
          <span>Blast Impact Zones</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[9px] text-center font-mono">
          <div className="bg-red-500/10 rounded-none px-1 py-0.5 leading-tight">
            <span className="text-[7.5px] text-red-400 block font-sans font-semibold">Heavy</span>
            <span className="font-bold text-red-400">&lt;{heavyDamageRad}km</span>
          </div>
          <div className="bg-amber-500/10 rounded-none px-1 py-0.5 leading-tight">
            <span className="text-[7.5px] text-amber-400 block font-sans font-semibold">Thermal</span>
            <span className="font-bold text-amber-400">&lt;{thermalRad}km</span>
          </div>
          <div className="bg-yellow-500/10 rounded-none px-1 py-0.5 leading-tight">
            <span className="text-[7.5px] text-yellow-400 block font-sans font-semibold">Light</span>
            <span className="font-bold text-yellow-400">&lt;{lightDamageRad}km</span>
          </div>
        </div>
      </div>

      {/* Coordinates & Wiki link */}
      <div className="flex justify-between items-center text-[9px] font-mono text-text-muted px-0.5">
        <span className="flex items-center gap-1">
          <IconPin className="w-2.5 h-2.5 text-accent-blue" />
          {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
        </span>
        {system.wiki_url && (
          <a
            href={system.wiki_url}
            target="_blank"
            rel="noreferrer"
            className="text-accent-blue hover:underline flex items-center gap-0.5 font-sans font-semibold text-[9.5px]"
          >
            <span>Wikipedia</span>
            <IconExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1.5 pt-0.5">
        <button
          onClick={onDetonate}
          className="nm-btn flex-1 h-7 rounded-none text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
          style={{ color: detonated ? '#f59e0b' : '#ef4444' }}
        >
          <IconBlast className="w-3 h-3" />
          <span>{detonated ? 'RESET BLAST' : 'DETONATE'}</span>
        </button>
        <button
          onClick={onRemove}
          className="nm-btn h-7 px-3 rounded-none text-[11px] font-semibold flex items-center justify-center gap-1 text-text-muted hover:text-red-400 cursor-pointer transition-all"
        >
          <IconTrash className="w-3 h-3" />
          <span>REMOVE</span>
        </button>
      </div>
    </div>
  )
}

function MilitaryBasePopupContent({ base, liveWiki, loading, onClose }) {
  const summaryText = liveWiki?.extract || base.summary || 'Strategic military installation.'
  const thumbnail = liveWiki?.thumbnail || base.thumbnail
  const wikiUrl =
    liveWiki?.wiki_url ||
    base.wiki_url ||
    `https://en.wikipedia.org/wiki/${encodeURIComponent(base.wiki_title || base.name)}`

  // Live status from Wikipedia analysis or base config
  const statusType = liveWiki?.liveStatus || base.status || 'active'
  const statusLabel =
    liveWiki?.liveStatusLabel ||
    (statusType === 'decommissioned'
      ? 'DECOMMISSIONED / HISTORIC'
      : statusType === 'temporary'
      ? 'FORWARD OPERATING / TEMPORARY'
      : 'OPERATIONAL / ACTIVE')

  const isDecom = statusType === 'decommissioned'
  const isTemp = statusType === 'temporary'
  const badgeClass = isDecom
    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    : isTemp
    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'

  return (
    <div className="w-full flex flex-col p-2.5 gap-2 select-text overflow-hidden rounded-none">
      {/* Header: Crossed Swords, Status, Country & Close */}
      <div className="flex items-center justify-between gap-1.5 border-b border-border-card pb-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[8.5px] font-bold tracking-wide uppercase border ${badgeClass}`}>
            <span className="text-xs">⚔</span>
            <span>{statusLabel}</span>
          </span>
          <span className="text-[9px] font-bold px-1 py-0.5 rounded-none bg-slate-800 text-slate-200 border border-slate-700">
            {base.country}
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-none nm-btn text-text-muted hover:text-text-primary shrink-0 transition-colors cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <IconClose className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Base Name & Operator Command */}
      <div>
        <div className="text-xs font-extrabold panel-title leading-snug truncate" title={base.name}>
          {base.name}
        </div>
        {base.operator && (
          <div className="text-[10px] panel-sub mt-0.5 flex items-center gap-1 font-medium truncate text-text-muted">
            <span className="text-emerald-400 font-semibold shrink-0">Command:</span>
            <span className="truncate">{base.operator}</span>
          </div>
        )}
      </div>

      {/* Live Wikipedia Thumbnail Photo (if available) */}
      {thumbnail && (
        <div className="relative w-full h-24 overflow-hidden rounded-none border border-border-card bg-slate-950">
          <img
            src={thumbnail}
            alt={base.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[7.5px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>Wikipedia Media</span>
          </div>
        </div>
      )}

      {/* Live Wikipedia Description */}
      <div className="nm-input p-2 rounded-none max-h-24 overflow-y-auto popup-desc-scroll text-[10px] leading-relaxed text-text-secondary">
        {loading ? (
          <div className="flex items-center gap-2 py-1 text-text-muted">
            <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Wikipedia...</span>
          </div>
        ) : (
          <p className="select-text leading-relaxed whitespace-normal">{summaryText}</p>
        )}
      </div>

      {/* Key Assets Deployed */}
      {base.assets && (
        <div className="nm-card px-2 py-1 rounded-none text-[9px] text-text-secondary border-l-2 border-emerald-400">
          <span className="text-text-muted font-bold block uppercase text-[7.5px]">Deployed Assets:</span>
          <span className="text-emerald-400 font-mono font-medium truncate block">{base.assets}</span>
        </div>
      )}

      {/* Coordinates & External Wikipedia Link */}
      <div className="flex justify-between items-center text-[9px] font-mono text-text-muted px-0.5">
        <span className="flex items-center gap-1">
          <IconPin className="w-2.5 h-2.5 text-emerald-400" />
          {base.lat.toFixed(4)}°, {base.lng.toFixed(4)}°
        </span>
        <a
          href={wikiUrl}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-400 hover:underline flex items-center gap-0.5 font-sans font-semibold text-[9.5px]"
        >
          <span>Wikipedia</span>
          <IconExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  )
}

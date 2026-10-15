import { useState, useMemo, useEffect, useRef } from 'react'
import { searchWeapons } from '../services/wikiWeaponLookup'
import {
  IconSearch,
  IconPin,
  IconPlus,
  IconClose,
  Icon3DMissile,
  Icon3DAirDefense,
  Icon3DFighterJet,
  Icon3DDrone,
  Icon3DWarship,
  Icon3DCustom,
  IconCountryBadge,
  OriginDisplay,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconCrosshair,
  IconGlobe,
} from './Icons'

const TYPE_COLORS = {
  sam: '#06b6d4',
  missile: '#ef4444',
  aircraft: '#a855f7',
  drone: '#10b981',
  navy: '#3b82f6',
  custom: '#f59e0b',
}

const TYPE_LABELS = {
  sam: 'Air Defense',
  missile: 'Missile',
  aircraft: 'Aircraft',
  drone: 'Drone / UAV',
  navy: 'Navy / Ship',
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
    case 'custom':
    default:
      return <Icon3DCustom className={className} />
  }
}

export default function MobileSheet({
  systems,
  onSelectSystem,
  onAddCustom,
  placedSystems,
  onRemoveSystem,
  onToggleVisibility,
  onClearAll,
  visibleTypes,
  onToggleType,
  selectedSystem,
}) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('browse')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [customName, setCustomName] = useState('')
  const [customRange, setCustomRange] = useState('')
  const [customType, setCustomType] = useState('missile')
  const [wikiResults, setWikiResults] = useState([])
  const [isSearchingWiki, setIsSearchingWiki] = useState(false)
  const abortRef = useRef(null)

  useEffect(() => {
    if (search.trim().length < 2) {
      setWikiResults([])
      return
    }

    const timer = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setIsSearchingWiki(true)

      try {
        const { results } = await searchWeapons(search.trim(), {
          maxResults: 6,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setWikiResults(results)
        }
      } catch {
        // Ignored
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingWiki(false)
        }
      }
    }, 600)

    return () => {
      clearTimeout(timer)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [search])

  const filteredLocal = useMemo(() => {
    let f = systems
    if (filter !== 'all') f = f.filter((s) => s.type === filter)
    if (search.trim()) {
      const terms = search.toLowerCase().split(/\s+/)
      f = f.filter((s) => {
        const searchable = `${s.name} ${s.origin || ''} ${s.type} ${s.tags || ''}`.toLowerCase()
        return terms.every((t) => searchable.includes(t))
      })
    }
    return f
  }, [systems, search, filter])

  const filteredWiki = useMemo(() => {
    let w = wikiResults
    if (filter !== 'all') w = w.filter((s) => s.type === filter)
    const localNames = new Set(filteredLocal.map((s) => s.name.toLowerCase()))
    return w.filter((s) => !localNames.has(s.name.toLowerCase()))
  }, [wikiResults, filteredLocal, filter])

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customName.trim() || !customRange) return
    onAddCustom({
      name: customName.trim(),
      range_km: Number(customRange),
      type: customType,
      origin: 'Custom',
    })
    setCustomName('')
    setCustomRange('')
  }

  const tabs = [
    { k: 'browse', icon: <IconSearch className="w-4 h-4" />, l: 'Systems' },
    { k: 'placed', icon: <IconPin className="w-4 h-4" />, l: 'Placed' },
    { k: 'custom', icon: <IconPlus className="w-4 h-4" />, l: 'Custom' },
  ]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300 pointer-events-auto
        ${expanded ? 'h-[75vh]' : 'h-16'}`}
    >
      <div className="h-full nm-card rounded-t-2xl shadow-2xl flex flex-col border-b-0">
        {/* Drag / Tap Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 flex justify-center shrink-0 cursor-pointer"
          aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
        >
          <div className="w-12 h-1 rounded-full bg-text-muted/40"></div>
        </button>

        {/* Collapsed Bottom Navigation Bar */}
        {!expanded && (
          <div className="flex items-center justify-around px-2 pb-2 h-full">
            {tabs.map((t) => (
              <button
                key={t.k}
                onClick={() => {
                  setExpanded(true)
                  setTab(t.k)
                }}
                className="nm-btn flex-1 mx-1.5 h-11 rounded-xl flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary relative cursor-pointer"
              >
                {t.icon}
                <span className="text-xs font-semibold">{t.l}</span>
                {t.k === 'placed' && placedSystems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-blue text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {placedSystems.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Expanded Drawer Content */}
        {expanded && (
          <>
            {/* Top Navigation Tabs inside Drawer */}
            <div className="flex border-b border-white/5 shrink-0 px-3 py-1.5 gap-2 bg-black/10">
              {tabs.map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`nm-btn flex-1 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer
                    ${tab === t.k ? 'nm-btn-active text-accent-blue font-bold' : 'text-text-muted'}`}
                >
                  {t.icon}
                  <span>{t.l}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {/* Browse Tab */}
              {tab === 'browse' && (
                <div className="flex flex-col gap-2.5">
                  <div className="relative flex items-center">
                    <span className="absolute left-3 z-10 pointer-events-none text-text-muted flex items-center">
                      <IconSearch className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search any weapon worldwide..."
                      style={{ paddingLeft: '34px', paddingRight: search ? '30px' : '12px' }}
                      className="nm-input w-full h-11 rounded-xl text-xs"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 p-1 text-text-muted hover:text-text-primary"
                      >
                        <IconClose className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Buttons: Rectangular (ayatoakar), centered text */}
                  <div className="flex flex-col gap-1.5">
                    <div className="grid grid-cols-4 gap-1 items-stretch">
                      {['all', 'sam', 'missile', 'aircraft'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilter(t)}
                          className={`h-8 px-1 rounded-md text-[11px] font-semibold flex items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                            filter === t
                              ? 'nm-btn-active font-bold text-white shadow-sm'
                              : 'nm-btn text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {t !== 'all' && renderTypeIcon(t, 'w-3.5 h-3.5 shrink-0')}
                          <span className="truncate leading-none">
                            {t === 'all' ? 'All' : TYPE_LABELS[t]}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1 items-stretch">
                      {['drone', 'navy'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilter(t)}
                          className={`h-8 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center text-center gap-1.5 cursor-pointer transition-all ${
                            filter === t
                              ? 'nm-btn-active font-bold text-white shadow-sm'
                              : 'nm-btn text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {renderTypeIcon(t, 'w-3.5 h-3.5 shrink-0')}
                          <span className="truncate leading-none">{TYPE_LABELS[t]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {search && (
                    <div className="text-[10px] text-text-muted flex justify-between items-center px-1">
                      <span>{filteredLocal.length + filteredWiki.length} systems found</span>
                      {isSearchingWiki && (
                        <span className="text-accent-blue font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping"></span>
                          Scanning Wikipedia...
                        </span>
                      )}
                    </div>
                  )}

                  {/* Local Systems */}
                  {filteredLocal.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSystem(s)
                        setExpanded(false)
                      }}
                      className={`w-full text-left p-2 rounded-xl cursor-pointer system-card ${
                        selectedSystem?.id === s.id ? 'is-selected' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 p-1 border card-icon-wrap"
                          style={{ background: `${TYPE_COLORS[s.type]}18`, borderColor: `${TYPE_COLORS[s.type]}40` }}
                        >
                          {renderTypeIcon(s.type, 'w-7 h-7')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold card-name whitespace-nowrap overflow-x-auto scrollbar-thin py-0.5">
                            {s.name}
                          </div>
                          <div className="text-[10px] card-meta font-mono mt-1 flex items-center gap-1.5 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none">
                            <span className="text-accent-blue font-bold shrink-0 leading-none">
                              {s.range_km >= 1000 ? `${(s.range_km / 1000).toFixed(1)}K` : s.range_km} km
                            </span>
                            {s.origin && (
                              <span className="flex items-center gap-1 card-meta shrink-0 leading-none">
                                <span className="opacity-40 leading-none">•</span>
                                <OriginDisplay origin={s.origin} flagClass="shrink-0 text-xs" textClass="leading-none" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Wikipedia Systems */}
                  {filteredWiki.length > 0 && (
                    <>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 pt-2 pb-1 border-t border-white/5 flex items-center gap-1.5">
                        <IconGlobe className="w-3.5 h-3.5" />
                        <span>Live Wikipedia Results</span>
                      </div>
                      {filteredWiki.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectSystem(s)
                            setExpanded(false)
                          }}
                          className="w-full text-left p-2 rounded-xl cursor-pointer system-card"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 p-1 border card-icon-wrap"
                              style={{ background: `${TYPE_COLORS[s.type]}18`, borderColor: `${TYPE_COLORS[s.type]}40` }}
                            >
                              {renderTypeIcon(s.type, 'w-7 h-7')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold card-name flex items-center justify-between gap-1">
                                <span className="whitespace-nowrap overflow-x-auto scrollbar-thin py-0.5">{s.name}</span>
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1 py-0.2 rounded font-bold shrink-0">
                                  WIKI
                                </span>
                              </div>
                              <div className="text-[10px] card-meta font-mono mt-1 flex items-center gap-1.5 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none">
                                <span className="text-accent-blue font-bold shrink-0 leading-none">
                                  {s.range_km >= 1000 ? `${(s.range_km / 1000).toFixed(1)}K` : s.range_km} km
                                </span>
                                {s.origin && (
                                  <span className="flex items-center gap-1 card-meta shrink-0 leading-none">
                                    <span className="opacity-40 leading-none">•</span>
                                    <OriginDisplay origin={s.origin} flagClass="shrink-0 text-xs" textClass="leading-none" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Placed Systems Tab */}
              {tab === 'placed' && (
                <div className="flex flex-col gap-2">
                  {placedSystems.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-xs">
                      No systems deployed on map.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-muted">
                          {placedSystems.length} deployed system(s)
                        </span>
                        <button
                          onClick={onClearAll}
                          className="text-xs text-accent-red font-bold cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      {placedSystems.map((p) => (
                        <div
                          key={p.id}
                          className="placed-card flex items-center gap-2 p-2 rounded-xl"
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 card-icon-wrap p-1 border"
                            style={{ color: TYPE_COLORS[p.system.type], background: `${TYPE_COLORS[p.system.type]}15`, borderColor: `${TYPE_COLORS[p.system.type]}40` }}
                          >
                            {renderTypeIcon(p.system.type, 'w-6 h-6')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate card-name flex items-center gap-1.5">
                              <span>{p.system.name}</span>
                              {p.system.origin && (
                                <OriginDisplay origin={p.system.origin} flagClass="w-3.5 h-2.5 rounded-xs" showNames={false} />
                              )}
                            </div>
                            <div className="text-[10px] card-meta font-mono">
                              {p.position.lat.toFixed(2)}°, {p.position.lng.toFixed(2)}° •{' '}
                              {p.system.range_km} km
                            </div>
                          </div>
                          <button
                            onClick={() => onToggleVisibility(p.id)}
                            className="nm-btn p-2 rounded-lg text-text-secondary"
                            title="Toggle visibility"
                          >
                            {p.visible ? <IconEye className="w-3.5 h-3.5" /> : <IconEyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => onRemoveSystem(p.id)}
                            className="nm-btn p-2 rounded-lg text-text-muted hover:text-accent-red"
                            title="Remove"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Custom System Tab */}
              {tab === 'custom' && (
                <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="System Name *"
                    required
                    className="nm-input w-full px-3 py-2.5 rounded-xl text-xs"
                  />
                  <input
                    type="number"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="Range (km) *"
                    required
                    min="1"
                    className="nm-input w-full px-3 py-2.5 rounded-xl text-xs font-mono"
                  />
                  <div className="grid grid-cols-6 gap-1.5">
                    {['missile', 'sam', 'aircraft', 'drone', 'navy', 'custom'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCustomType(t)}
                        className={`nm-btn h-11 rounded-xl flex items-center justify-center cursor-pointer p-1.5
                          ${customType === t ? 'nm-btn-active font-bold' : ''}`}
                      >
                        {renderTypeIcon(t, 'w-6 h-6')}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="nm-btn w-full h-11 rounded-xl text-xs font-bold text-accent-blue flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <IconCrosshair className="w-4 h-4" />
                    <span>DEPLOY ON MAP</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

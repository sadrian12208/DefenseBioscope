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
  Icon3DTank,
  IconSpeed,
  IconBlast,
} from './Icons'

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

function MobileSystemCard({ system, onSelect, isSelected }) {
  const color = TYPE_COLORS[system.type] || TYPE_COLORS.custom
  const speed = system.specs?.speed
  const payload = system.specs?.payload
  const breakdown = system.range_breakdown

  return (
    <button
      onClick={() => onSelect(system)}
      className={`w-full text-left p-2 rounded-none cursor-pointer relative overflow-hidden group system-card ${
        isSelected ? 'is-selected' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Uniform 3D Icon Box with Brutalist Border */}
        <div
          className="w-11 h-11 rounded-none flex items-center justify-center shrink-0 p-1 border card-icon-wrap"
          style={{ background: `${color}18`, borderColor: `${color}40` }}
        >
          {renderTypeIcon(system.type, 'w-7 h-7')}
        </div>

        <div className="flex-1 min-w-0">
          {/* Weapon Name Row */}
          <div className="flex items-center justify-between gap-1.5">
            <div
              className="font-bold text-xs card-name whitespace-nowrap overflow-x-auto scrollbar-thin py-0.5 select-text"
              title={system.name}
            >
              {system.name}
            </div>
            {system.isWiki && (
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                WIKI
              </span>
            )}
          </div>

          {/* Single-line Metadata: Classification Badge, Range km, and Country Flag */}
          <div className="flex items-center gap-2 mt-1 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none card-meta">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none shrink-0 leading-none"
              style={{
                color: (system.type === 'custom' || system.type === 'tank') ? '#10b981' : color,
                background: (system.type === 'custom' || system.type === 'tank') ? '#10b98122' : `${color}22`,
                border: `1px solid ${(system.type === 'custom' || system.type === 'tank') ? '#10b98145' : `${color}45`}`,
              }}
            >
              {TYPE_LABELS[system.type] || 'System'}
            </span>

            <span className="text-[11px] font-mono font-bold card-name tracking-tight shrink-0 leading-none">
              {system.range_km >= 1000
                ? `${(system.range_km / 1000).toFixed(1)}K`
                : system.range_km}{' '}
              km
            </span>

            {/* Real Country Badge & Name — hidden for custom/tank types */}
            {system.origin && system.type !== 'custom' && system.type !== 'tank' && (
              <span className="flex items-center gap-1 text-[11px] card-meta shrink-0 leading-none" title={system.origin}>
                <OriginDisplay origin={system.origin} flagClass="shrink-0 text-xs" textClass="leading-none" />
              </span>
            )}
          </div>

          {/* Technical Specs & Range Breakdown (Horizontally scrollable with mini slidebar) */}
          {(speed || payload || (breakdown && (breakdown.combat_km || breakdown.ferry_km))) && (
            <div className="flex items-center gap-2 mt-1 text-[9px] card-meta overflow-x-auto whitespace-nowrap scrollbar-thin py-0.5">
              {breakdown?.combat_km && (
                <span className="flex items-center gap-1 text-cyan-400 font-mono shrink-0">
                  <IconCrosshair className="w-3 h-3" />
                  {breakdown.combat_km}km combat
                </span>
              )}
              {speed && (
                <span className="flex items-center gap-1 text-amber-400 font-medium shrink-0">
                  <IconSpeed className="w-3 h-3 shrink-0" />
                  {speed}
                </span>
              )}
              {payload && (
                <span className="flex items-center gap-1 shrink-0">
                  <IconBlast className="w-3 h-3 text-red-400 shrink-0" />
                  {payload}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function MobilePlacedItem({ placement, onRemove, onToggle }) {
  const color = TYPE_COLORS[placement.system.type] || TYPE_COLORS.custom

  return (
    <div className="flex items-center gap-2 p-2 rounded-none placed-card">
      <div
        className="w-9 h-9 rounded-none flex items-center justify-center shrink-0 card-icon-wrap p-1 border"
        style={{ color, background: `${color}15`, borderColor: `${color}40` }}
      >
        {renderTypeIcon(placement.system.type, 'w-6 h-6')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold card-name truncate flex items-center gap-1.5">
          <span>{placement.system.name}</span>
          {placement.system.origin && (
            <OriginDisplay origin={placement.system.origin} flagClass="w-3.5 h-2.5 rounded-none" showNames={false} />
          )}
        </div>
        <div className="text-[10px] card-meta font-mono">
          {placement.position.lat.toFixed(2)}°, {placement.position.lng.toFixed(2)}° •{' '}
          {placement.system.range_km} km
        </div>
      </div>
      <button
        onClick={() => onToggle(placement.id)}
        className="nm-btn p-2 rounded-none text-text-secondary hover:text-text-primary cursor-pointer"
        title="Toggle visibility"
      >
        {placement.visible ? <IconEye className="w-3.5 h-3.5" /> : <IconEyeOff className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => onRemove(placement.id)}
        className="nm-btn p-2 rounded-none text-text-muted hover:text-accent-red cursor-pointer"
        title="Remove"
      >
        <IconTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  )
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
  expanded: controlledExpanded,
  onToggleExpanded,
  onClose,
}) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded

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

  const handleToggle = () => {
    if (onToggleExpanded) {
      onToggleExpanded()
    } else {
      setLocalExpanded((prev) => !prev)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else if (onToggleExpanded) {
      onToggleExpanded()
    } else {
      setLocalExpanded(false)
    }
  }

  const tabs = [
    { k: 'browse', icon: <IconSearch className="w-4 h-4" />, l: 'Systems' },
    { k: 'placed', icon: <IconPin className="w-4 h-4" />, l: 'Placed' },
    { k: 'custom', icon: <IconPlus className="w-4 h-4" />, l: 'Custom' },
  ]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1000] transition-all duration-300 pointer-events-auto select-none
        ${isExpanded ? 'h-[80vh] sm:h-[75vh]' : 'h-[68px]'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="h-full nm-card rounded-t-2xl shadow-2xl flex flex-col border-b-0 overflow-hidden">
        {/* Drag / Tap Handle */}
        <button
          onClick={handleToggle}
          className="w-full pt-2 pb-1.5 flex justify-center shrink-0 cursor-pointer"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
        >
          <div className="w-12 h-1 rounded-full bg-text-muted/40"></div>
        </button>

        {/* Collapsed Bottom Navigation Bar */}
        {!isExpanded && (
          <div className="flex items-center justify-around px-2 pb-2 h-full">
            {tabs.map((t) => (
              <button
                key={t.k}
                onClick={() => {
                  setTab(t.k)
                  if (!isExpanded) {
                    if (onToggleExpanded) onToggleExpanded()
                    else setLocalExpanded(true)
                  }
                }}
                className="nm-btn flex-1 mx-1 h-10 rounded-none flex items-center justify-center gap-1.5 text-text-secondary hover:text-text-primary relative cursor-pointer"
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
        {isExpanded && (
          <>
            {/* Top Navigation Tabs inside Drawer + Close X Button */}
            <div className="flex border-b border-white/5 shrink-0 px-2.5 py-1.5 gap-1.5 bg-black/15">
              {tabs.map((t) => (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  className={`nm-btn flex-1 h-9 rounded-none text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer
                    ${tab === t.k ? 'nm-btn-active text-accent-blue font-bold' : 'text-text-muted'}`}
                >
                  {t.icon}
                  <span>{t.l}</span>
                  {t.k === 'placed' && placedSystems.length > 0 && (
                    <span className="bg-accent-blue text-white text-[9px] px-1 rounded-full font-bold">
                      {placedSystems.length}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleClose}
                className="nm-btn w-9 h-9 rounded-none text-text-muted hover:text-white shrink-0 flex items-center justify-center cursor-pointer"
                title="Collapse drawer"
                aria-label="Collapse drawer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {/* Browse Tab */}
              {tab === 'browse' && (
                <div className="flex flex-col gap-2.5">
                  {/* Search Weapon Input */}
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
                      className="nm-input w-full h-10 rounded-none text-xs"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 p-1 text-text-muted hover:text-text-primary cursor-pointer"
                        title="Clear search"
                      >
                        <IconClose className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Buttons: 2 rows of 3, centered, brutalist square */}
                  <div className="flex flex-col gap-1 select-none">
                    <div className="grid grid-cols-3 gap-1">
                      {['all', 'sam', 'missile'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilter(t)}
                          className={`h-7.5 px-1 rounded-none text-[10.5px] font-bold flex items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                            filter === t
                              ? 'nm-btn-active font-extrabold text-white shadow-sm'
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

                    <div className="grid grid-cols-3 gap-1">
                      {['aircraft', 'drone', 'navy'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilter(t)}
                          className={`h-7.5 px-1 rounded-none text-[10.5px] font-bold flex items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                            filter === t
                              ? 'nm-btn-active font-extrabold text-white shadow-sm'
                              : 'nm-btn text-text-muted hover:text-text-primary'
                          }`}
                        >
                          {renderTypeIcon(t, 'w-3.5 h-3.5 shrink-0')}
                          <span className="truncate leading-none">{TYPE_LABELS[t]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Systems Count Indicator */}
                  {search && (
                    <div className="text-[10px] text-text-muted flex justify-between items-center px-0.5">
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
                  <div className="flex flex-col gap-1.5">
                    {filteredLocal.map((s) => (
                      <MobileSystemCard
                        key={s.id}
                        system={s}
                        isSelected={selectedSystem?.id === s.id}
                        onSelect={(system) => {
                          onSelectSystem(system)
                          handleClose()
                        }}
                      />
                    ))}
                  </div>

                  {/* Wikipedia Systems */}
                  {filteredWiki.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 pb-1 flex items-center gap-1.5">
                        <IconGlobe className="w-3.5 h-3.5" />
                        <span>Live Wikipedia Results</span>
                      </div>
                      {filteredWiki.map((s) => (
                        <MobileSystemCard
                          key={s.id}
                          system={s}
                          isSelected={selectedSystem?.id === s.id}
                          onSelect={(system) => {
                            onSelectSystem(system)
                            handleClose()
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Placed Systems Tab */}
              {tab === 'placed' && (
                <div className="flex flex-col gap-2">
                  {placedSystems.length === 0 ? (
                    <div className="text-center py-8 text-text-muted text-xs">
                      No systems deployed on map. Tap 'Systems' tab to choose and deploy.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center px-0.5 mb-1">
                        <span className="text-xs text-text-muted font-medium">
                          {placedSystems.length} deployed system(s)
                        </span>
                        <button
                          onClick={onClearAll}
                          className="text-xs text-accent-red font-bold cursor-pointer hover:underline"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {placedSystems.map((p) => (
                          <MobilePlacedItem
                            key={p.id}
                            placement={p}
                            onToggle={onToggleVisibility}
                            onRemove={onRemoveSystem}
                          />
                        ))}
                      </div>
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
                    className="nm-input w-full px-3 py-2 rounded-none text-xs"
                  />
                  <input
                    type="number"
                    value={customRange}
                    onChange={(e) => setCustomRange(e.target.value)}
                    placeholder="Range (km) *"
                    required
                    min="1"
                    className="nm-input w-full px-3 py-2 rounded-none text-xs font-mono"
                  />
                  <div className="grid grid-cols-6 gap-1">
                    {['missile', 'sam', 'aircraft', 'drone', 'navy', 'custom'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCustomType(t)}
                        className={`nm-btn h-10 rounded-none flex items-center justify-center cursor-pointer p-1
                          ${customType === t ? 'nm-btn-active font-bold' : ''}`}
                        title={TYPE_LABELS[t] || t}
                      >
                        {renderTypeIcon(t, 'w-5 h-5')}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="nm-btn w-full h-10 rounded-none text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <IconCrosshair className="w-4 h-4 text-emerald-400" />
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

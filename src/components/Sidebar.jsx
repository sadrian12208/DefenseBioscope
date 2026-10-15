import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react'
import { searchWeapons } from '../services/wikiWeaponLookup'
import {
  IconSearch,
  IconPin,
  IconPlus,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconClose,
  Icon3DMissile,
  Icon3DAirDefense,
  Icon3DFighterJet,
  Icon3DDrone,
  Icon3DWarship,
  Icon3DCustom,
  IconCountryBadge,
  OriginDisplay,
  IconBlast,
  IconSpeed,
  IconCrosshair,
  IconGlobe,
  IconAlert,
  Icon3DTank,
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

function renderTypeIcon(type, className = 'w-7 h-7') {
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

const SystemCard = memo(function SystemCard({ system, onSelect, isSelected }) {
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
        {/* Uniform 3D Logo Icon for ALL systems */}
        <div
          className="w-11 h-11 rounded-none flex items-center justify-center shrink-0 p-1 border transition-transform group-hover:scale-105 card-icon-wrap"
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
              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                WIKI
              </span>
            )}
          </div>

          {/* Single-line Metadata: Classification Badge, Range km, and Country Flag */}
          <div className="flex items-center gap-2 mt-1 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none card-meta">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 leading-none"
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
})

const PlacedItem = memo(function PlacedItem({ placement, onRemove, onToggle }) {
  const color = TYPE_COLORS[placement.system.type] || TYPE_COLORS.custom

  return (
    <div className="flex items-center gap-2 p-2 rounded-none placed-card animate-fade-in-up">
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
            <OriginDisplay origin={placement.system.origin} flagClass="w-3.5 h-2.5 rounded-xs" showNames={false} />
          )}
        </div>
        <div className="text-[10px] card-meta font-mono">
          {placement.position.lat.toFixed(2)}°, {placement.position.lng.toFixed(2)}° •{' '}
          {placement.system.range_km} km
        </div>
      </div>
      <button
        onClick={() => onToggle(placement.id)}
        className="nm-btn p-1.5 rounded-lg text-text-secondary hover:text-text-primary"
        title={placement.visible ? 'Hide coverage' : 'Show coverage'}
        aria-label="Toggle visibility"
      >
        {placement.visible ? <IconEye className="w-3.5 h-3.5" /> : <IconEyeOff className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => onRemove(placement.id)}
        className="nm-btn p-1.5 rounded-lg text-text-muted hover:text-accent-red"
        title="Remove system"
        aria-label="Remove system"
      >
        <IconTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  )
})

export default function Sidebar({
  systems,
  onSelectSystem,
  onAddCustom,
  placedSystems,
  onRemoveSystem,
  onToggleVisibility,
  onClearAll,
  isOpen,
  selectedSystem,
}) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  const [filterType, setFilterType] = useState('all')
  const [customName, setCustomName] = useState('')
  const [customRange, setCustomRange] = useState('')
  const [customType, setCustomType] = useState('missile')
  const [wikiResults, setWikiResults] = useState([])
  const [isSearchingWiki, setIsSearchingWiki] = useState(false)
  const [wikiError, setWikiError] = useState('')
  const abortRef = useRef(null)

  // Execute Wikipedia deep search
  const performWikiSearch = async (term) => {
    if (!term || term.trim().length < 2) {
      setWikiResults([])
      setWikiError('')
      return
    }

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearchingWiki(true)
    setWikiError('')

    try {
      const { results, errors } = await searchWeapons(term.trim(), {
        maxResults: 12,
        signal: controller.signal,
      })

      if (!controller.signal.aborted) {
        setWikiResults(results)
        if (results.length === 0 && errors.length > 0) {
          setWikiError(errors[0])
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        // Wiki search error handled via UI state
        setWikiError(e.message || 'Wikipedia search error. Check network connection.')
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSearchingWiki(false)
      }
    }
  }

  // Debounced search when typing
  useEffect(() => {
    if (search.trim().length < 2) {
      setWikiResults([])
      setWikiError('')
      return
    }

    const timer = setTimeout(() => {
      performWikiSearch(search)
    }, 600)

    return () => {
      clearTimeout(timer)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [search])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      performWikiSearch(search)
    }
  }

  const localResults = useMemo(() => {
    let f = systems
    if (filterType !== 'all') f = f.filter((s) => s.type === filterType)
    if (search.trim()) {
      const terms = search.toLowerCase().split(/\s+/)
      f = f.filter((s) => {
        const searchable = `${s.name} ${s.origin || ''} ${s.type} ${s.tags || ''}`.toLowerCase()
        return terms.every((t) => searchable.includes(t))
      })
    }
    return f
  }, [systems, search, filterType])

  const extraWikiResults = useMemo(() => {
    let w = wikiResults
    if (filterType !== 'all') w = w.filter((s) => s.type === filterType)
    const localNames = new Set(localResults.map((s) => s.name.toLowerCase()))
    return w.filter((s) => !localNames.has(s.name.toLowerCase()))
  }, [wikiResults, localResults, filterType])

  const totalResults = localResults.length + extraWikiResults.length

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

  if (!isOpen) return null

  return (
    <aside className="absolute bottom-6 left-4 w-[290px] sm:w-[320px] max-h-[520px] z-[1000] flex flex-col shadow-2xl">
      <div className="flex flex-col h-full nm-card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 shrink-0 p-1.5 gap-1 bg-black/10">
          {[
            { key: 'browse', label: 'Systems', icon: <IconSearch className="w-3.5 h-3.5" /> },
            {
              key: 'placed',
              label: `Placed (${placedSystems.length})`,
              icon: <IconPin className="w-3.5 h-3.5" />,
            },
            { key: 'custom', label: 'Custom', icon: <IconPlus className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5
                ${
                  activeTab === tab.key
                    ? 'nm-btn-active font-bold text-accent-blue'
                    : 'text-text-muted hover:text-text-primary'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'browse' && (
            <div className="flex flex-col gap-2.5">
              {/* Clean Glitch-Free Search Box (Without GO button) */}
              <div className="relative flex items-center">
                <span className="absolute left-3 z-10 pointer-events-none text-text-muted flex items-center">
                  <IconSearch className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search weapon worldwide..."
                  style={{ paddingLeft: '34px', paddingRight: search ? '30px' : '12px' }}
                  className="nm-input w-full h-10 rounded-xl text-xs font-medium"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 p-1 text-text-muted hover:text-text-primary transition-all cursor-pointer flex items-center"
                    title="Clear search"
                  >
                    <IconClose className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Buttons: Rectangular (ayatoakar), centered text */}
              <div className="flex flex-col gap-1.5">
                <div className="grid grid-cols-4 gap-1 items-stretch">
                  {['all', 'sam', 'missile', 'aircraft'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`h-7 px-1 rounded-md text-[10.5px] font-semibold flex items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                        filterType === type
                          ? 'nm-btn-active font-bold text-white shadow-sm'
                          : 'nm-btn text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {type !== 'all' && renderTypeIcon(type, 'w-3.5 h-3.5 shrink-0')}
                      <span className="truncate leading-none">
                        {type === 'all' ? 'All' : TYPE_LABELS[type]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1 items-stretch">
                  {['drone', 'navy'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`h-7 px-1.5 rounded-md text-[10.5px] font-semibold flex items-center justify-center text-center gap-1 cursor-pointer transition-all ${
                        filterType === type
                          ? 'nm-btn-active font-bold text-white shadow-sm'
                          : 'nm-btn text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {renderTypeIcon(type, 'w-3.5 h-3.5 shrink-0')}
                      <span className="truncate leading-none">{TYPE_LABELS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Header */}
              {search && (
                <div className="text-[10px] text-text-muted flex justify-between items-center px-0.5">
                  <span>
                    {totalResults} result{totalResults !== 1 ? 's' : ''}
                  </span>
                  {isSearchingWiki && (
                    <span className="text-accent-blue font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping"></span>
                      Scanning Wikipedia...
                    </span>
                  )}
                </div>
              )}

              {/* Validation / Error Message */}
              {wikiError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <IconAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{wikiError}</span>
                </div>
              )}

              {/* Results List */}
              <div className="flex flex-col gap-2">
                {/* Local Systems */}
                {localResults.map((s) => (
                  <SystemCard
                    key={s.id}
                    system={s}
                    onSelect={onSelectSystem}
                    isSelected={selectedSystem?.id === s.id}
                  />
                ))}

                {/* Wikipedia Sourced Results */}
                {extraWikiResults.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 py-1 mt-1">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                        <IconGlobe className="w-3 h-3" /> Live Wikipedia Extracted
                      </span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    {extraWikiResults.map((s) => (
                      <SystemCard
                        key={s.id}
                        system={s}
                        onSelect={onSelectSystem}
                        isSelected={selectedSystem?.id === s.id}
                      />
                    ))}
                  </>
                )}

                {/* Empty State */}
                {totalResults === 0 && !isSearchingWiki && (
                  <div className="text-center text-text-muted py-8">
                    <IconSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <div className="font-semibold text-xs text-text-primary">No systems found</div>
                    <div className="text-[10px] text-text-muted mt-1">
                      Type any world missile, fighter jet, or UAV name to query Wikipedia.
                    </div>
                  </div>
                )}

                {totalResults === 0 && isSearchingWiki && (
                  <div className="text-center text-text-muted py-8">
                    <IconGlobe className="w-8 h-8 mx-auto mb-2 text-accent-blue animate-pulse" />
                    <div className="font-semibold text-xs text-accent-blue">Extracting real data from Wikipedia...</div>
                    <div className="text-[10px] text-text-muted mt-1">
                      Validating military infobox wikitext and operational ranges
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'placed' && (
            <div className="flex flex-col gap-2">
              {placedSystems.length === 0 ? (
                <div className="text-center py-10">
                  <IconPin className="w-8 h-8 mx-auto mb-2 opacity-40 text-text-muted" />
                  <div className="text-xs text-text-primary font-semibold">No systems deployed</div>
                  <div className="text-[10px] text-text-muted mt-1">
                    Select a weapon system and click on the map to deploy it.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-muted font-medium">
                      {placedSystems.length} active deployment(s)
                    </span>
                    <button
                      onClick={onClearAll}
                      className="text-[10px] text-accent-red font-bold uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  {placedSystems.map((p) => (
                    <PlacedItem
                      key={p.id}
                      placement={p}
                      onRemove={onRemoveSystem}
                      onToggle={onToggleVisibility}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2.5">
              <div className="text-[11px] text-text-muted leading-relaxed">
                Add custom defense hardware with manually specified operational range.
              </div>
              <div>
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1 block">
                  System Name *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Hypersonic Glide Vehicle"
                  required
                  className="nm-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1 block">
                  Operational Range (km) *
                </label>
                <input
                  type="number"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  min="1"
                  className="nm-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1 block">
                  Classification
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {['missile', 'sam', 'aircraft', 'drone', 'navy', 'custom'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomType(t)}
                      className={`nm-btn h-10 rounded-lg flex items-center justify-center cursor-pointer p-1
                        ${customType === t ? 'nm-btn-active font-bold' : ''}`}
                      title={TYPE_LABELS[t]}
                    >
                      {renderTypeIcon(t, 'w-6 h-6')}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="nm-btn w-full py-2.5 mt-2 rounded-xl text-xs font-bold text-accent-blue flex items-center justify-center gap-1.5"
              >
                <IconCrosshair className="w-4 h-4" />
                <span>DEPLOY TO THEATER</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  )
}

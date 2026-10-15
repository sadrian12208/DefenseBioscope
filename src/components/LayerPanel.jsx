import {
  IconClose,
  Icon3DAirDefense,
  Icon3DMissile,
  Icon3DFighterJet,
  Icon3DDrone,
  Icon3DWarship,
  Icon3DCustom,
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

function renderLayerIcon(type, className = 'w-4 h-4') {
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

export default function LayerPanel({ visibleTypes, onToggleType, onClose, placedSystems }) {
  const typeCounts = placedSystems.reduce((acc, p) => {
    acc[p.system.type] = (acc[p.system.type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="absolute top-16 right-3 sm:right-4 z-[1002] w-64 animate-fade-in-up">
      <div className="nm-card overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/5 bg-black/10">
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Layer Controls
          </span>
          <button
            onClick={onClose}
            className="nm-btn p-1.5 rounded-lg text-text-muted hover:text-accent-red cursor-pointer"
            aria-label="Close Layer Panel"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2">
          {Object.keys(TYPE_LABELS).map((type) => {
            const isVisible = visibleTypes[type]
            const color = TYPE_COLORS[type]

            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all w-full text-left cursor-pointer
                  ${isVisible ? 'nm-btn' : 'nm-btn opacity-50'}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 nm-input"
                  style={{ color }}
                >
                  {renderLayerIcon(type, 'w-4 h-4')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">
                    {TYPE_LABELS[type]}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
                    {typeCounts[type] || 0} active
                  </div>
                </div>

                {/* Tactical Toggle Switch */}
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors flex items-center
                    ${isVisible ? 'bg-accent-blue/30 border border-accent-blue/40' : 'bg-black/30 border border-white/10'}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform duration-200 shadow-sm
                      ${isVisible ? 'translate-x-4 bg-accent-blue' : 'translate-x-0 bg-text-muted'}`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        <div className="px-3.5 py-2.5 border-t border-white/5 bg-black/5">
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <div className="w-2.5 h-2.5 rounded-full border border-dashed border-accent-blue shrink-0"></div>
            <span>Dashed rings represent maximum range</span>
          </div>
        </div>
      </div>
    </div>
  )
}

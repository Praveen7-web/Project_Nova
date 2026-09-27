import React from 'react';
import { useStore } from '../store/useStore';
import type { StatusLevel } from '../types';
import { AlertTriangle, CheckCircle2, SlidersHorizontal } from 'lucide-react';

const statusStyles: Record<StatusLevel, { stripe: string; bg: string; badge: string; text: string; icon: React.ReactNode }> = {
  NOMINAL: {
    stripe: 'border-l-4 border-emerald-500',
    bg: 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800',
    badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    text: 'text-emerald-400',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />
  },
  WARNING: {
    stripe: 'border-l-4 border-amber-500',
    bg: 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800',
    badge: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    text: 'text-amber-400',
    icon: <AlertTriangle className="w-3.5 h-3.5" />
  },
  CRITICAL: {
    stripe: 'border-l-4 border-rose-500',
    bg: 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800',
    badge: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    text: 'text-rose-400',
    icon: (
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
      </span>
    )
  }
};

export const DataGrid: React.FC = () => {
  const { mode, challengeEntities, demoEntities, activeEntityId, setActiveEntityId, updateEntityMetric, config } = useStore();
  const entities = mode === 'challenge' ? challengeEntities : demoEntities;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Monitored Marine Sectors</span>
          <span className="text-xs font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
            {entities.length} Locations
          </span>
        </h2>
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          Click card to inspect or use slider to test live <code className="text-cyan-300">deriveStatus()</code>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => {
          const isSelected = entity.id === activeEntityId;
          const style = statusStyles[entity.status];

          return (
            <div
              key={entity.id}
              onClick={() => setActiveEntityId(entity.id)}
              className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${style.stripe} ${style.bg} ${
                isSelected
                  ? 'ring-2 ring-cyan-500 border-transparent shadow-lg shadow-cyan-950/40 bg-slate-900'
                  : 'hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    ID: {entity.id}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {entity.label}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1.5 ${style.badge}`}>
                  {style.icon}
                  <span>{entity.status}</span>
                </span>
              </div>

              {/* Metric Value Display */}
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-xs text-slate-400 font-medium">
                  {config.primaryMetricLabel}
                </div>
                <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                  <span>{entity.primaryMetric}</span>
                  <span className="text-xs font-normal text-slate-400">{config.metricUnit ?? ''}</span>
                </div>
              </div>

              {/* Live Status Threshold Derivation Slider */}
              <div
                className="mt-4 pt-3 border-t border-slate-800/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Test Metric Value</span>
                  <span className="font-semibold text-cyan-400">{entity.primaryMetric} {config.metricUnit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={entity.primaryMetric}
                  onChange={(e) => updateEntityMetric(entity.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                  <span>0</span>
                  <span className="text-amber-500/80">Warn: {config.warningThreshold}</span>
                  <span className="text-rose-500/80">Crit: {config.criticalThreshold}</span>
                  <span>150</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

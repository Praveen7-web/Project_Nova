import React from 'react';
import { useStore } from '../store/useStore';
import { calculateTrend } from '../services/ai';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { TrendDirection } from '../types';

const trendBadges: Record<TrendDirection, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  improving: {
    label: 'Improving Trend',
    bg: 'bg-emerald-950/80 border-emerald-800/60',
    text: 'text-emerald-400',
    icon: <TrendingDown className="w-3.5 h-3.5" /> // for higher-is-worse, decreasing waste is improving!
  },
  worsening: {
    label: 'Worsening Trend',
    bg: 'bg-rose-950/80 border-rose-800/60',
    text: 'text-rose-400',
    icon: <TrendingUp className="w-3.5 h-3.5" />
  },
  stable: {
    label: 'Stable Trend',
    bg: 'bg-slate-800/80 border-slate-700',
    text: 'text-slate-300',
    icon: <Minus className="w-3.5 h-3.5" />
  }
};

export const ChartPanel: React.FC = () => {
  const { mode, challengeEntities, demoEntities, activeEntityId, config } = useStore();
  const entities = mode === 'challenge' ? challengeEntities : demoEntities;
  const entity = entities.find(e => e.id === activeEntityId) || entities[0];

  if (!entity) return null;

  const trend = calculateTrend(entity.historicalData, config.metricPolarity);
  const trendStyle = trendBadges[trend];

  // Dynamic gradient color matching status
  const statusColor = entity.status === 'CRITICAL' ? '#f43f5e' : entity.status === 'WARNING' ? '#f59e0b' : '#10b981';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Historical Telemetry & Threshold Analysis</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing telemetry stream for <span className="text-slate-200 font-semibold">{entity.label}</span> ({entity.id})
          </p>
        </div>

        <div className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 self-start sm:self-auto ${trendStyle.bg} ${trendStyle.text}`}>
          {trendStyle.icon}
          <span>{trendStyle.label}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={entity.historicalData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={statusColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={statusColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit={` ${config.metricUnit ?? ''}`} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value: number) => [`${value} ${config.metricUnit ?? ''}`, config.primaryMetricLabel]}
            />

            {/* Threshold Reference Lines */}
            {config.warningThreshold !== undefined && (
              <ReferenceLine
                y={config.warningThreshold}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Warning (${config.warningThreshold})`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
            )}

            {config.criticalThreshold !== undefined && (
              <ReferenceLine
                y={config.criticalThreshold}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Critical (${config.criticalThreshold})`,
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={statusColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { generateInsight, calculateTrend } from '../services/ai';
import type { AIInsightResponse, TrendDirection } from '../types';
import { Bot, Sparkles, AlertCircle, RefreshCw, ShieldCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendBadges: Record<TrendDirection, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  improving: {
    label: 'Improving Trend',
    bg: 'bg-emerald-950/80 border-emerald-800/60',
    text: 'text-emerald-400',
    icon: <TrendingDown className="w-3.5 h-3.5" />
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

export const AIInsightPanel: React.FC = () => {
  const { mode, challengeEntities, demoEntities, activeEntityId, config } = useStore();
  const entities = mode === 'challenge' ? challengeEntities : demoEntities;
  const entity = entities.find(e => e.id === activeEntityId) || entities[0];

  const [insight, setInsight] = useState<AIInsightResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInsight = async () => {
    if (!entity) return;
    setLoading(true);

    const startTime = Date.now();
    try {
      const response = await generateInsight(entity, config);
      // Enforce 500ms minimum loader duration to prevent UI flashing
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
      setInsight(response);
    } catch (err) {
      console.error("AI Insight Error:", err);
      setInsight({
        summary: entity.fallbackSummary,
        action: entity.fallbackAction,
        confidence: 0,
        source: 'fallback'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [entity?.id, entity?.primaryMetric, config]);

  if (!entity) return null;

  const trend = calculateTrend(entity.historicalData, config.metricPolarity);
  const trendStyle = trendBadges[trend];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950 text-cyan-400 rounded-lg border border-cyan-800/50">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gemini Operational Synthesis</span>
              </h3>
              <p className="text-xs text-slate-400">Structured AI Diagnostic & Guidance</p>
            </div>
          </div>

          <button
            onClick={fetchInsight}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
            title="Re-analyze Sector"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Source Badge & Deterministic Trend */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          {/* Source Badge */}
          {insight?.source === 'live' ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>● Live AI</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
              <span>○ Offline Fallback</span>
            </span>
          )}

          {/* Deterministic Trend Badge */}
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 ${trendStyle.bg} ${trendStyle.text}`}>
            {trendStyle.icon}
            <span>{trendStyle.label}</span>
          </span>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="mt-6 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
            <div className="h-12 bg-slate-800/60 rounded-xl mt-4"></div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Operational Summary (Exactly 2 sentences) */}
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Operational Interpretation
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                {insight?.summary}
              </p>
            </div>

            {/* Recommended Action (Exactly 1 sentence) */}
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Recommended Response Protocol
              </h4>
              <p className="text-sm font-medium text-cyan-300 leading-relaxed bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-900/50">
                {insight?.action}
              </p>
            </div>

            {/* Confidence Meter (Shown ONLY in Live AI state) */}
            {insight?.source === 'live' && typeof insight.confidence === 'number' && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    AI confidence · model-reported
                  </span>
                  <span className="font-bold text-emerald-400">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 p-0.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, insight.confidence * 100))}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

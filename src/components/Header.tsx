import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Waves, Sparkles, Layers, Anchor } from 'lucide-react';

export const Header: React.FC = () => {
  const { config, mode, setMode } = useStore();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      {/* Demo Mode Top Banner */}
      {mode === 'demo' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-300 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 tracking-wide uppercase">
          <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>DEMO DATA · Synthetic Scenario</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand & Problem Statement */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-950/50 text-cyan-400">
              <Waves className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  {config.appName}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 rounded-full flex items-center gap-1">
                  <Anchor className="w-3 h-3" />
                  {config.domain}
                </span>
                {config.showSDG && config.sdgAlignment && (
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {config.sdgAlignment}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl font-normal">
                {config.problemStatement}
              </p>
            </div>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setMode('challenge')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'challenge'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Challenge Mode
            </button>
            <button
              onClick={() => setMode('demo')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                mode === 'demo'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Demo Mode
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

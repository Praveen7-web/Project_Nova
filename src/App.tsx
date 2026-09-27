import { Header } from './components/Header';
import { DataGrid } from './components/DataGrid';
import { ChartPanel } from './components/ChartPanel';
import { AIInsightPanel } from './components/AIInsightPanel';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Monitored Locations Grid */}
        <section>
          <DataGrid />
        </section>

        {/* Analytics & AI Insight Panel Split View */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartPanel />
          </div>
          <div className="lg:col-span-1">
            <AIInsightPanel />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        AquaClean Sentinel · Domain-Agnostic Rescue Analytics Engine · Gemini 3.8 Flash Driven
      </footer>
    </div>
  );
}

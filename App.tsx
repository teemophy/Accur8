import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Bell, TrendingUp, Activity, BarChart3, 
  Zap, RefreshCcw, History, Newspaper, 
  ArrowUpRight, ArrowDownRight, Sparkles, SlidersHorizontal, CheckCircle2,
  X, ExternalLink, Filter, Globe, Shield, Info, Link2, Code, Target, BrainCircuit, Menu, ChevronRight, Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, MarketPrice } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from './services/gemini';

// --- Sub-Components ---

const TacticalAggregatorBox = ({ market, onTrade }: { market: Market | null, onTrade: () => void }) => (
  <div className="jup-panel p-6 mb-8 bg-gradient-to-b from-[#161b2a] to-[#10141f]">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xs font-black uppercase tracking-widest jup-gradient-text">Aggregator Routing</h3>
      <div className="flex gap-2">
        <Settings2 size={16} className="text-white/20 hover:text-white cursor-pointer" />
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="bg-[#030408] rounded-2xl p-4 border border-white/5">
        <label className="text-[10px] font-bold text-white/30 uppercase block mb-2">Target Event</label>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-white truncate max-w-[200px]">
            {market ? market.question : "Select a market below..."}
          </span>
          {market && <span className="bg-[#c7f284]/10 text-[#c7f284] px-2 py-0.5 rounded text-[10px] font-black uppercase">Active</span>}
        </div>
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="bg-[#10141f] p-2 rounded-full border border-white/5">
          <ArrowDownRight size={16} className="text-[#c7f284]" />
        </div>
      </div>

      <div className="bg-[#030408] rounded-2xl p-4 border border-white/5">
        <label className="text-[10px] font-bold text-white/30 uppercase block mb-2">Best Route (By Accuracy & Price)</label>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔷</span>
            <span className="text-sm font-bold text-white">Polymarket</span>
          </div>
          <span className="text-lg font-black text-white">{market ? `${market.consensus}%` : "--"}</span>
        </div>
      </div>
    </div>

    <button 
      onClick={onTrade}
      disabled={!market}
      className="w-full jup-button py-4 rounded-2xl mt-6 uppercase tracking-widest text-xs disabled:opacity-30 flex items-center justify-center gap-2"
    >
      {market ? `Route Prediction Order` : "Select Market to Participate"}
    </button>
  </div>
);

const AccuracyLayer = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="jup-panel p-8 bg-gradient-to-br from-[#10141f] to-transparent">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-[#c7f284]" size={24} />
            <h2 className="text-2xl font-black italic uppercase tracking-tight">The Accuracy Moat</h2>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            PredictHub is more than an aggregator; it is a <span className="text-white font-bold">Verification Oracle</span>. We analyze historical platform deviations to calculate the "True Probability" of any event.
          </p>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[8px] font-black text-white/30 uppercase">Brier Score (Avg)</p>
              <p className="text-lg font-black text-[#c7f284]">0.142</p>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[8px] font-black text-white/30 uppercase">Verified Events</p>
              <p className="text-lg font-black text-white">42,891</p>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white/5 rounded-3xl p-6 border border-white/10">
           <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Real-time Platform Drift</h4>
           <div className="space-y-4">
              {PLATFORMS.map(p => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/60">{p.name}</span>
                    <span className="text-white">{p.accuracy}% Precision</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.accuracy}%` }} className="h-full bg-[#c7f284]" />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LIVE);
  const [search, setSearch] = useState("");
  const [ticker, setTicker] = useState(0);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 12000);
    return () => clearInterval(timer);
  }, []);

  const marketData = useMemo(() => {
    return INITIAL_MARKETS.map(m => {
      const prices = { ...m.prices };
      const vals = Object.values(prices).filter((v): v is number => v !== undefined);
      const consensus = vals.length === 0 ? 0 : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      const arbGap = vals.length < 2 ? 0 : Math.max(...vals) - Math.min(...vals);
      return { ...m, prices, consensus, arbGap };
    }).filter(m => 
      m.question.toLowerCase().includes(search.toLowerCase()) || 
      m.category.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (b.arbGap || 0) - (a.arbGap || 0));
  }, [ticker, search]);

  const handleAiInsights = async () => {
    setActiveTab(TabType.AI_INSIGHTS);
    if (!aiAnalysis) {
      setIsAnalyzing(true);
      try {
        const analysis = await getGeminiMarketAnalysis(marketData);
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis("Routing intelligence unavailable. Retrying...");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleTrade = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#030408] text-white flex flex-col font-sans">
      {/* Jupiter-style Header */}
      <nav className="h-16 border-b border-white/5 bg-[#030408]/80 backdrop-blur-xl sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(TabType.LIVE)}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-[#c7f284] to-[#00beee] rounded-xl flex items-center justify-center shadow-lg shadow-[#c7f284]/10">
              <Activity size={20} className="text-black" />
            </div>
            <span className="font-black text-lg md:text-2xl tracking-tighter uppercase italic flex items-center">
              Predict<span className="jup-gradient-text">Hub</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-1">
            {[TabType.LIVE, TabType.ACCURACY, TabType.INTEGRATE].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#c7f284] bg-[#c7f284]/5' : 'text-white/40 hover:text-white'}`}
              >
                {tab === TabType.LIVE ? 'Aggregator' : tab === TabType.ACCURACY ? 'Verification' : 'Integrate'}
              </button>
            ))}
            <button 
              onClick={handleAiInsights}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === TabType.AI_INSIGHTS ? 'text-[#00beee] bg-[#00beee]/5' : 'text-white/40 hover:text-white'}`}
            >
              <Sparkles size={12} /> Router AI
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text" placeholder="Search Markets..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-[11px] w-48 md:w-64 focus:outline-none focus:border-[#c7f284]/50 transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="lg:hidden p-2 text-white/40" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#c7f284] to-[#00beee] p-[1px]">
               <div className="w-full h-full rounded-full bg-[#030408] flex items-center justify-center">
                  <Shield size={16} className="text-[#c7f284]" />
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-[#030408] z-[200] p-8 flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <span className="font-black italic text-xl jup-gradient-text uppercase">PredictHub</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-2xl"><X /></button>
            </div>
            <div className="flex flex-col gap-6">
              {[TabType.LIVE, TabType.ACCURACY, TabType.INTEGRATE].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                  className={`text-4xl font-black text-left uppercase italic ${activeTab === tab ? 'text-[#c7f284]' : 'text-white/40'}`}
                >
                  {tab}
                </button>
              ))}
              <button onClick={() => { handleAiInsights(); setIsMobileMenuOpen(false); }} className="text-4xl font-black text-left uppercase italic text-[#00beee]">AI Router</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 grid grid-cols-12 gap-8">
        
        {/* Aggregator Center View */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === TabType.LIVE && (
              <motion.div key="terminal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                
                {/* Jupiter-like Swap Box */}
                <TacticalAggregatorBox 
                  market={selectedMarket} 
                  onTrade={handleTrade} 
                />

                <div className="jup-panel overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Verified Market Streams</h2>
                    <div className="flex gap-2">
                       <Filter size={14} className="text-white/20 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase">Market</th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase text-center mobile-hide">Consensus</th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase text-center">Route Bests</th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase text-right">Spread</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {marketData.map(m => (
                          <tr 
                            key={m.id} 
                            onClick={() => setSelectedMarket(m)}
                            className={`hover:bg-white/[0.02] cursor-pointer transition-all ${selectedMarket?.id === m.id ? 'bg-[#c7f284]/5' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-bold text-white line-clamp-1">{m.question}</p>
                              <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{m.category}</span>
                            </td>
                            <td className="px-6 py-4 text-center mobile-hide">
                              <span className="text-sm font-black text-[#c7f284]">{m.consensus}%</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex justify-center gap-1">
                                  {Object.entries(m.prices).map(([p, v]) => (
                                    <div key={p} className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold" title={`${p}: ${v}%`}>
                                      {p[0].toUpperCase()}
                                    </div>
                                  ))}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${m.arbGap! >= 5 ? 'bg-[#c7f284]/10 text-[#c7f284] border-[#c7f284]/20' : 'bg-white/5 text-white/30 border-white/5'}`}>
                                 {m.arbGap}%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.ACCURACY && <AccuracyLayer key="accuracy" />}

            {activeTab === TabType.AI_INSIGHTS && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="jup-panel p-10 min-h-[500px] bg-gradient-to-b from-[#10141f] to-transparent">
                 <div className="flex items-center gap-6 mb-12">
                    <div className="p-5 bg-[#00beee] rounded-3xl shadow-xl shadow-[#00beee]/10"><BrainCircuit size={40} className="text-black" /></div>
                    <div>
                      <h2 className="text-3xl font-black uppercase italic italic tracking-tighter">Router Intelligence</h2>
                      <p className="text-[10px] text-[#00beee] font-bold uppercase tracking-[0.4em]">Tactical AI Entry Points • Gemini 3</p>
                    </div>
                 </div>
                 {isAnalyzing ? (
                   <div className="space-y-6">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-white/5 animate-pulse rounded-full" style={{ width: `${100 - (i * 10)}%` }} />)}
                   </div>
                 ) : (
                   <div className="text-white/70 leading-relaxed text-base prose prose-invert max-w-none">
                      {aiAnalysis || "Aggregating cross-platform order books to determine the highest Expected Value (EV) participation route..."}
                   </div>
                 )}
                 {!aiAnalysis && !isAnalyzing && (
                   <button onClick={handleAiInsights} className="mt-10 bg-[#00beee] text-black font-black px-12 py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-[#00beee]/10">Run Strategy Router</button>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Sidebar Info - Desktop */}
        <aside className="hidden lg:col-span-4 lg:flex flex-col gap-8">
           <div className="jup-panel p-6 bg-[#161b2a]/30">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2"><TrendingUp size={12} /> Live Ticker Streams</h4>
              <div className="space-y-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">US Election 2026 Prediction</p>
                       </div>
                       <ChevronRight size={14} className="text-white/20 group-hover:text-white" />
                    </div>
                 ))}
              </div>
           </div>

           <div className="jup-panel p-8 text-center border-[#c7f284]/10">
              <Code size={32} className="text-[#c7f284] mx-auto mb-6" />
              <h4 className="text-lg font-black uppercase italic mb-4">Integrate Hub</h4>
              <p className="text-xs text-white/40 leading-relaxed mb-8">Connect your prediction order book to the Hub's unified terminal for instant liquidity and institutional exposure.</p>
              <button className="w-full bg-white/5 border border-white/10 hover:border-[#c7f284] text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all">Request API Keys</button>
           </div>
        </aside>
      </main>

      {/* Floating Success Indicator */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-[#c7f284] text-black px-10 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-black/10">
            <CheckCircle2 size={24} />
            <p className="text-xs font-black uppercase tracking-widest">Routing Transaction Successful</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer Ticker */}
      <footer className="h-10 bg-[#030408] border-t border-white/5 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="inline-flex items-center gap-12 px-12">
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">BITCOIN: <span className="text-white">$102,590</span> <ArrowUpRight size={10} className="inline text-emerald-500"/></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">SOLANA: <span className="text-white">$252.1</span> <ArrowDownRight size={10} className="inline text-rose-500"/></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">GPT-5 PROB: <span className="text-white">72%</span> <ArrowUpRight size={10} className="inline text-emerald-500"/></span>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}
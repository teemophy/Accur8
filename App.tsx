import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Bell, TrendingUp, Activity, BarChart3, 
  Zap, RefreshCcw, History, Newspaper, 
  ArrowUpRight, ArrowDownRight, Sparkles, SlidersHorizontal, CheckCircle2,
  X, ExternalLink, Filter, Globe, Shield, Info, Link2, Code, Mail, Target, Award, BrainCircuit, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, MarketPrice } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from './services/gemini';

// --- Components ---

const AccuracyMoat = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="space-y-6 pb-20 md:pb-0"
  >
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
            <Target size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Platform Accuracy Moat</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Historical Reliability Index • Verified Outcomes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center">
            <p className="text-[8px] font-black text-white/30 uppercase">Tracked Events</p>
            <p className="text-lg font-black text-white">12,402</p>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-center">
            <p className="text-[8px] font-black text-white/30 uppercase">Avg. Brier Score</p>
            <p className="text-lg font-black text-emerald-500">0.142</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLATFORMS.map((p, idx) => (
        <div key={p.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.logo}</span>
              <span className="font-black text-white uppercase tracking-tighter italic">{p.name}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black">
              <ArrowUpRight size={12} /> {idx === 0 ? '+2.4%' : '+0.8%'}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[9px] font-black text-white/40 uppercase mb-1">
                <span>Predictive Precision</span>
                <span className="text-white">{p.accuracy}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${p.accuracy}%` }}
                  className="h-full bg-indigo-500" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase">Politics Rank</p>
                <p className="text-xs font-bold text-white">#{idx + 1}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase">Settlement Speed</p>
                <p className="text-xs font-bold text-white">{p.delay}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="glass-panel p-8 rounded-3xl border border-white/5">
      <h3 className="text-lg font-black text-white mb-6 uppercase italic tracking-tight flex items-center gap-3">
        <Award className="text-amber-500" /> The "Brier Score" Moat
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className="text-sm text-white/70 leading-relaxed">
            PredictHub uses the <span className="text-white font-bold">Brier Score</span>—the gold standard in forecasting—to rank platforms. 
            A lower score means a platform's prices (probabilities) align closer to actual reality.
          </p>
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Institutional Insight</p>
            <p className="text-xs text-white/80 italic">"Don't trade on price alone. Trade where the platform history suggests the crowd is actually correct."</p>
          </div>
        </div>
        <div className="relative h-48 bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex items-end px-10 gap-8">
           <div className="w-full bg-indigo-500/20 h-[80%] rounded-t-lg relative group">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400">POLY</div>
              <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg" />
           </div>
           <div className="w-full bg-emerald-500/20 h-[65%] rounded-t-lg relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-500">KALSHI</div>
              <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg" />
           </div>
           <div className="w-full bg-rose-500/20 h-[40%] rounded-t-lg relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-rose-500">PREDIT</div>
              <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="absolute bottom-0 w-full bg-rose-500 rounded-t-lg" />
           </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const PlatformWidget = React.memo(({ platform }: { platform: Platform }) => (
  <div className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-xl transition-colors">
    <div className="flex items-center gap-3">
      <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{platform.logo}</span>
      <div>
        <p className="text-[11px] font-black text-white leading-none mb-1">{platform.name}</p>
        <p className="text-[9px] text-white/30 font-bold uppercase">{platform.delay}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center justify-end gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${platform.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <p className={`text-[9px] font-black ${platform.status === 'Operational' ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>{platform.status.toUpperCase()}</p>
      </div>
      <p className="text-[9px] text-white/20 font-bold">{platform.volume}</p>
    </div>
  </div>
));

const MarketRow = React.memo(({ market, isSelected, onClick, arbThreshold }: { market: Market; isSelected: boolean; onClick: () => void; arbThreshold: number }) => (
  <tr 
    onClick={onClick}
    className={`hover:bg-indigo-500/[0.04] transition-all group cursor-pointer border-t border-white/5 ${isSelected ? 'bg-indigo-500/[0.08]' : ''}`}
  >
    <td className="px-4 py-4 md:px-6">
      <div className="flex flex-col">
        <span className="text-[12px] md:text-[13px] font-bold text-slate-100 group-hover:text-white transition-colors leading-tight line-clamp-2 md:line-clamp-none">{market.question}</span>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[8px] md:text-[9px] text-indigo-400 font-black uppercase tracking-widest">{market.category}</span>
          <span className="text-[8px] md:text-[9px] text-white/20 font-bold uppercase flex items-center gap-1"><History size={10} /> {market.ends}</span>
        </div>
      </div>
    </td>
    <td className="px-4 py-4 md:px-6 mobile-hide">
      <div className="flex flex-col">
        <span className="text-sm font-black text-white">{market.consensus}%</span>
        <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${market.consensus}%` }} />
        </div>
      </div>
    </td>
    <td className="px-4 py-4 md:px-6 text-center font-mono text-[10px] md:text-[11px] font-bold text-white/40">{market.prices.polymarket ?? '--'}¢</td>
    <td className="px-4 py-4 md:px-6 text-center font-mono text-[10px] md:text-[11px] font-bold text-white/40 mobile-hide">{market.prices.kalshi ?? '--'}¢</td>
    <td className="px-4 py-4 md:px-6 text-center font-mono text-[10px] md:text-[11px] font-bold text-white/40 mobile-hide">{market.prices.predictit ?? '--'}¢</td>
    <td className="px-4 py-4 md:px-6 text-right">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black border transition-all ${market.arbGap! >= arbThreshold ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-white/5 text-white/20 border-white/10'}`}>
        {market.arbGap! >= arbThreshold && <Zap size={10} className="fill-emerald-500" />}
        {market.arbGap}%
      </div>
    </td>
  </tr>
));

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LIVE);
  const [search, setSearch] = useState("");
  const [arbThreshold] = useState(5);
  const [ticker, setTicker] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketAiInsight, setMarketAiInsight] = useState<string | null>(null);
  const [isSpecificAnalyzing, setIsSpecificAnalyzing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 10000);
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
        setAiAnalysis("Intelligence link unstable. Re-syncing...");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleMarketSelect = async (market: Market) => {
    setSelectedMarket(market);
    setMarketAiInsight(null);
    setIsSpecificAnalyzing(true);
    try {
      const insight = await getGeminiSpecificMarketDeepDive(market);
      setMarketAiInsight(insight);
    } catch (error) {
      setMarketAiInsight("AI analysis unavailable for this ticker.");
    } finally {
      setIsSpecificAnalyzing(false);
    }
  };

  const executeTrade = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-200 flex flex-col">
      {/* Navigation */}
      <nav className="h-16 border-b border-white/5 bg-[#06080f]/95 backdrop-blur-xl sticky top-0 z-[100] px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab(TabType.LIVE)}>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-xl shadow-indigo-600/20">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-black text-lg md:text-xl tracking-tight uppercase italic flex items-center">
              Predict<span className="text-indigo-500">Hub</span>
              <span className="hidden sm:inline text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 not-italic ml-1">TERMINAL</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {[TabType.LIVE, TabType.ACCURACY, TabType.INTEGRATE].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {tab === TabType.LIVE ? 'Markets' : tab === TabType.ACCURACY ? 'Accuracy Moat' : 'API Port'}
              </button>
            ))}
            <button 
              onClick={handleAiInsights}
              className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === TabType.AI_INSIGHTS ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-fuchsia-400/60 hover:text-fuchsia-400'}`}
            >
              <Sparkles size={10} /> AI Intel
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text" placeholder="Filter..." 
              className="bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-[11px] w-40 md:w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="lg:hidden p-2 text-white/60" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-5">
            <div className="relative cursor-pointer"><Bell size={18} className="text-white/40" /></div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 border border-white/20 rotate-45" />
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-[#06080f] z-[150] p-10 flex flex-col gap-6"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-black text-xl italic">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
            </div>
            {[TabType.LIVE, TabType.ACCURACY, TabType.INTEGRATE].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                className="text-3xl font-black text-left uppercase italic hover:text-indigo-500 transition-colors"
              >
                {tab}
              </button>
            ))}
            <button 
              onClick={() => { handleAiInsights(); setIsMobileMenuOpen(false); }}
              className="text-3xl font-black text-left uppercase italic text-fuchsia-500"
            >
              AI INTEL
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-12 gap-6 relative">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">Pulse <Globe size={12} className="text-indigo-400" /></h3>
            <div className="space-y-2">
              {PLATFORMS.map(p => <PlatformWidget key={p.id} platform={p} />)}
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Live Wire</h3>
            <div className="space-y-4">
              {NEWS_FEED.map(n => (
                <div key={n.id} className="border-l-2 border-indigo-500/20 pl-3 py-1 hover:border-indigo-500 transition-all cursor-pointer">
                  <p className="text-[11px] font-bold text-white/90 leading-tight mb-1">{n.title}</p>
                  <span className="text-[8px] text-indigo-400 font-black uppercase">{n.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Section */}
        <section className="col-span-12 lg:col-span-9 space-y-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === TabType.LIVE && (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="glass-panel p-4 md:p-6 rounded-2xl border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-500/5 to-transparent flex flex-col md:flex-row md:items-center gap-4">
                  <Zap size={24} className="text-indigo-400 flex-shrink-0" />
                  <p className="text-[12px] md:text-[13px] text-white/70 leading-relaxed font-medium">
                    <span className="text-white font-black">Aggregating {marketData.length} Top Markets.</span> Focus on the <span className="text-indigo-400 font-black">Price Difference (Spread)</span> for quick profit participation.
                  </p>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                      <thead className="bg-white/[0.02]">
                        <tr className="border-b border-white/5">
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest">Market Identity</th>
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest mobile-hide text-center">Consensus</th>
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Poly</th>
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest text-center mobile-hide">Kalshi</th>
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest text-center mobile-hide">PredIt</th>
                          <th className="px-4 py-4 md:px-6 text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Spread</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.map(m => (
                          <MarketRow key={m.id} market={m} isSelected={selectedMarket?.id === m.id} arbThreshold={arbThreshold} onClick={() => handleMarketSelect(m)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.ACCURACY && <AccuracyMoat key="accuracy" />}

            {activeTab === TabType.AI_INSIGHTS && (
              <motion.div key="ai" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-3xl p-8 md:p-12 min-h-[500px] border border-fuchsia-500/10">
                <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-fuchsia-600 rounded-2xl shadow-xl shadow-fuchsia-600/20"><BrainCircuit size={32} className="text-white" /></div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight leading-none">AI Participating Brief</h2>
                    <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-[0.3em] mt-1">Best Case Participation Analysis • Gemini 3</p>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-4 bg-white/5 animate-pulse rounded-full" style={{ width: `${100 - (i * 12)}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-white/80 leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                    {aiAnalysis || "Run the participating scan to identify the highest Expected Value (EV) opportunities across current markets."}
                  </div>
                )}

                {!aiAnalysis && !isAnalyzing && (
                  <button onClick={handleAiInsights} className="mt-8 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black px-10 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-fuchsia-600/20 active:scale-95">
                    Generate Participation Intel
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === TabType.INTEGRATE && (
              <motion.div key="integrate" className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 text-center flex flex-col items-center">
                <div className="p-6 bg-white/5 rounded-full mb-8"><Code size={48} className="text-indigo-400" /></div>
                <h2 className="text-3xl font-black uppercase italic tracking-tight text-white mb-4">Partner API Access</h2>
                <p className="text-white/40 max-w-md mb-10 text-sm leading-relaxed">Aggregating your order book into our terminal provides instant exposure to 50,000+ institutional and retail prediction traders.</p>
                <button className="bg-indigo-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20">Contact Integration Team</button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Ticker Tape */}
      <footer className="fixed bottom-0 left-0 w-full h-10 bg-[#06080f] backdrop-blur-xl border-t border-white/5 z-[100] flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap px-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest px-6">
              <span className="text-white/30 italic">BITCOIN: <span className="text-white">$102,450</span> <ArrowUpRight className="inline text-emerald-500" size={12}/></span>
              <span className="text-white/30 italic">FED CUT: <span className="text-white">64%</span> <ArrowDownRight className="inline text-rose-500" size={12}/></span>
              <span className="text-white/30 italic">ETH: <span className="text-white">$3,210</span> <ArrowUpRight className="inline text-emerald-500" size={12}/></span>
            </div>
          ))}
        </div>
      </footer>

      {/* Market Drawer */}
      <AnimatePresence>
        {selectedMarket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMarket(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0a0d14] border-l border-white/10 z-[210] p-6 md:p-12 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => setSelectedMarket(null)} className="p-3 bg-white/5 rounded-2xl"><X size={20}/></button>
                <div className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                  {selectedMarket.category}
                </div>
              </div>

              <div className="space-y-10">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white leading-tight">{selectedMarket.question}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/30 uppercase mb-2">Crowd Consensus</p>
                      <p className="text-4xl font-black text-indigo-500">{selectedMarket.consensus}%</p>
                   </div>
                   <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-black text-white/30 uppercase mb-2">Aggregated Volume</p>
                      <p className="text-xl font-bold text-white mt-1">{selectedMarket.volume}</p>
                   </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={12} className="text-indigo-400"/> Participation Strategy</h3>
                   <div className="space-y-4">
                      {Object.entries(selectedMarket.prices).map(([pid, price]) => (
                        <div key={pid} className="flex flex-col gap-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-white/60 capitalize">{pid}</span>
                            <span className="text-white font-black">{price}¢</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${price}%` }} className="h-full bg-indigo-500" />
                          </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-600/5">
                   <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={12}/> AI Tactical Scan</h3>
                   {isSpecificAnalyzing ? (
                     <div className="space-y-3">
                        <div className="h-2 w-full bg-white/10 animate-pulse rounded-full" />
                        <div className="h-2 w-3/4 bg-white/10 animate-pulse rounded-full" />
                     </div>
                   ) : (
                     <p className="text-sm text-white/80 leading-relaxed font-medium">{marketAiInsight}</p>
                   )}
                </div>

                <button onClick={executeTrade} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                  Route Participation Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <CheckCircle2 size={24} className="animate-bounce" />
            <p className="text-[11px] font-black uppercase tracking-widest">Participating Request Routed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
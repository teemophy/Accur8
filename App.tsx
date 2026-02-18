
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Bell, TrendingUp, Activity, BarChart3, 
  ShieldCheck, Zap, RefreshCcw, History, PieChart, 
  ArrowRight, ChevronRight, Trophy, Newspaper, 
  ArrowUpRight, ArrowDownRight, Sparkles, SlidersHorizontal, CheckCircle2,
  X, Info, ExternalLink, Filter, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, MarketPrice } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from './services/gemini';

const STORAGE_KEYS = {
  ACTIVE_TAB: 'ph_pref_active_tab',
  SEARCH: 'ph_pref_search',
  ARB_THRESHOLD: 'ph_pref_arb_threshold'
};

const calculateConsensus = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

const calculateArb = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  if (vals.length < 2) return 0;
  return Math.max(...vals) - Math.min(...vals);
};

type SortKey = 'question' | 'consensus' | 'arbGap';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    return (saved && Object.values(TabType).includes(saved as TabType)) ? (saved as TabType) : TabType.LIVE;
  });
  
  const [search, setSearch] = useState(() => localStorage.getItem(STORAGE_KEYS.SEARCH) || "");
  const [arbThreshold, setArbThreshold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARB_THRESHOLD);
    return saved ? parseInt(saved, 10) : 7;
  });

  const [ticker, setTicker] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketAiInsight, setMarketAiInsight] = useState<string | null>(null);
  const [isSpecificAnalyzing, setIsSpecificAnalyzing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'arbGap', direction: 'desc' });
  
  const [flashAlert, setFlashAlert] = useState(false);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const lastAlertId = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    localStorage.setItem(STORAGE_KEYS.SEARCH, search);
    localStorage.setItem(STORAGE_KEYS.ARB_THRESHOLD, arbThreshold.toString());
  }, [activeTab, search, arbThreshold]);

  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const marketData = useMemo(() => {
    let data = INITIAL_MARKETS.map(m => {
      const prices = { ...m.prices };
      if (ticker % 2 === 0) {
        if (prices.polymarket) prices.polymarket += Math.floor(Math.random() * 3) - 1;
        if (prices.kalshi) prices.kalshi += Math.floor(Math.random() * 3) - 1;
      }
      return {
        ...m,
        prices,
        consensus: calculateConsensus(prices),
        arbGap: calculateArb(prices)
      };
    }).filter(m => 
      m.question.toLowerCase().includes(search.toLowerCase()) || 
      m.category.toLowerCase().includes(search.toLowerCase())
    );

    return data.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [ticker, search, sortConfig]);

  const activeAlertMarket = useMemo(() => {
    const opportunities = marketData
      .filter(m => (m.arbGap || 0) >= arbThreshold)
      .sort((a, b) => (b.arbGap || 0) - (a.arbGap || 0));
    return opportunities[0] || null;
  }, [marketData, arbThreshold]);

  useEffect(() => {
    if (activeAlertMarket && activeAlertMarket.id !== lastAlertId.current) {
      setFlashAlert(true);
      const timer = setTimeout(() => setFlashAlert(false), 2000);
      lastAlertId.current = activeAlertMarket.id;
      return () => clearTimeout(timer);
    }
  }, [activeAlertMarket]);

  const handleExecuteTrade = () => {
    setExecutingTrade(true);
    setTimeout(() => {
      setExecutingTrade(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleAiInsights = async () => {
    setActiveTab(TabType.AI_INSIGHTS);
    if (!aiAnalysis) {
      setIsAnalyzing(true);
      try {
        const analysis = await getGeminiMarketAnalysis(marketData);
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis("Analysis currently unavailable.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleMarketClick = async (market: Market) => {
    setSelectedMarket(market);
    setMarketAiInsight(null);
    setIsSpecificAnalyzing(true);
    try {
      const insight = await getGeminiSpecificMarketDeepDive(market);
      setMarketAiInsight(insight);
    } catch (error) {
      setMarketAiInsight("Detailed intel unavailable.");
    } finally {
      setIsSpecificAnalyzing(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-200 font-sans selection:bg-indigo-500/30">
      <nav className="h-16 border-b border-white/5 bg-[#06080f]/90 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(TabType.LIVE)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-12 shadow-lg shadow-indigo-500/40">
              <TrendingUp size={18} className="text-white -rotate-12" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Predict<span className="text-indigo-500">Hub</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {[TabType.LIVE, TabType.ACCURACY, TabType.PORTFOLIO].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {tab === TabType.LIVE ? 'Live Comparison' : tab}
              </button>
            ))}
            <button 
              onClick={handleAiInsights}
              className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === TabType.AI_INSIGHTS ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' : 'text-fuchsia-400/60 hover:text-fuchsia-400 hover:bg-white/5'}`}
            >
              <Sparkles size={12} /> AI Insights
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <SlidersHorizontal size={14} className="text-white/40" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Arb Alert Threshold</span>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="1" max="20" 
                  value={arbThreshold} 
                  onChange={(e) => setArbThreshold(Number(e.target.value))}
                  className="w-24 accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-[10px] font-black text-indigo-400 min-w-[24px]">{arbThreshold}%</span>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" placeholder="Search markets..." 
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-[11px] w-56 focus:outline-none transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <Bell size={18} className="text-white/40 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 border border-white/20" />
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6 pb-24">
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-[#11141d] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Platform Status</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Syncing</span>
              </div>
            </div>
            <div className="space-y-5">
              {PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.logo}</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-none mb-1">{p.name}</p>
                      <p className="text-[9px] text-white/30 font-bold italic uppercase">{p.delay} latency</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-black ${p.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.status.toUpperCase()}</p>
                    <p className="text-[9px] text-white/20 font-bold">{p.volume}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
              Regulatory News <Newspaper size={12} />
            </h3>
            <div className="space-y-4">
              {NEWS_FEED.map(n => (
                <div key={n.id} className="group cursor-pointer">
                  <span className="text-[9px] font-black text-indigo-400 border border-indigo-400/30 px-1.5 py-0.5 rounded uppercase">{n.tag}</span>
                  <p className="text-xs font-medium text-white/80 mt-2 group-hover:text-white transition-colors">{n.title}</p>
                  <p className="text-[10px] text-white/30 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === TabType.LIVE && (
              <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <motion.div 
                  animate={{ 
                    backgroundColor: flashAlert ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.1)',
                    borderColor: flashAlert ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.2)'
                  }}
                  className={`border p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between relative gap-4 transition-colors duration-500 ${!activeAlertMarket ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${activeAlertMarket ? 'bg-indigo-600 animate-pulse' : 'bg-white/5'}`}>
                      <Zap size={20} className={activeAlertMarket ? 'text-white fill-white' : 'text-white/20'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          {activeAlertMarket ? 'High Divergence Detected' : 'Scanning Spreads'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white max-w-xl italic">
                        {activeAlertMarket 
                          ? `Significant price gap on "${activeAlertMarket.question}" exceeds your threshold.` 
                          : `Monitoring ${marketData.length} markets for opportunities.`}
                      </p>
                    </div>
                  </div>
                  {activeAlertMarket && (
                    <button 
                      onClick={handleExecuteTrade} disabled={executingTrade}
                      className="bg-white text-black font-black text-[10px] px-6 py-3 rounded-xl hover:bg-indigo-400 hover:text-white transition-all tracking-widest uppercase flex items-center gap-2"
                    >
                      {executingTrade ? <RefreshCcw size={12} className="animate-spin" /> : 'Execute Trade'}
                    </button>
                  )}
                </motion.div>

                <div className="bg-[#11141d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-white/[0.01] gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><Activity size={18} className="text-indigo-500" /></div>
                      <div>
                        <h2 className="font-black text-sm tracking-widest uppercase">Institutional Comparison Engine</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase">Real-time weighted consensus logic</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-[10px] font-black text-white/40 uppercase hover:bg-white/10 transition-colors">
                          <Filter size={12} /> Filter
                       </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th onClick={() => toggleSort('question')} className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center gap-2">Market Event <ArrowUpDown size={10} /></div>
                          </th>
                          <th onClick={() => toggleSort('consensus')} className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center gap-2">Consensus <ArrowUpDown size={10} /></div>
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Poly</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Kalshi</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">PredIt</th>
                          <th onClick={() => toggleSort('arbGap')} className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-right cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center gap-2 justify-end">Arb Gap <ArrowUpDown size={10} /></div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.map((m) => (
                          <tr 
                            key={m.id} 
                            onClick={() => handleMarketClick(m)}
                            className={`hover:bg-indigo-500/[0.05] transition-colors group cursor-pointer border-t border-white/5 ${selectedMarket?.id === m.id ? 'bg-indigo-500/[0.08]' : ''}`}
                          >
                            <td className="px-6 py-5">
                              <p className="text-[13px] font-black text-white leading-snug">{m.question}</p>
                              <span className="text-[9px] text-white/20 font-bold uppercase flex items-center gap-1 mt-1"><History size={10} /> {m.ends}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-lg font-black text-white">{m.consensus}%</span>
                            </td>
                            <td className="px-6 py-5 text-center font-mono font-bold text-white/60">{m.prices.polymarket ?? '--'}¢</td>
                            <td className="px-6 py-5 text-center font-mono font-bold text-white/60">{m.prices.kalshi ?? '--'}¢</td>
                            <td className="px-6 py-5 text-center font-mono font-bold text-white/60">{m.prices.predictit ?? '--'}¢</td>
                            <td className="px-6 py-5 text-right">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${m.arbGap! >= arbThreshold ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/10'}`}>
                                {m.arbGap! >= arbThreshold && <Zap size={10} className="fill-emerald-500" />} {m.arbGap}%
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

            {/* Other tabs follow similar structure... */}
            {activeTab === TabType.AI_INSIGHTS && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#11141d] border border-white/10 rounded-3xl p-8 min-h-[400px]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-fuchsia-600 rounded-2xl"><Sparkles size={24} className="text-white" /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Market Intelligence Briefing</h2>
                </div>
                {isAnalyzing ? <div className="space-y-4"><div className="h-4 w-full bg-white/5 animate-pulse rounded" /></div> : <div className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{aiAnalysis || "Run scan to generate intel."}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* SIDE DRAWER FOR MARKET DEEP DIVE */}
      <AnimatePresence>
        {selectedMarket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedMarket(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0a0d14] border-l border-white/10 z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-10">
                <button onClick={() => setSelectedMarket(null)} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-indigo-600 px-2 py-1 rounded text-white uppercase tracking-widest">{selectedMarket.category}</span>
                  <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"><ExternalLink size={20} /></button>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-tight italic">{selectedMarket.question}</h2>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/30 uppercase">Aggregated Consensus</span>
                      <span className="text-5xl font-black text-indigo-500">{selectedMarket.consensus}%</span>
                    </div>
                    <div className="h-12 w-px bg-white/10 mx-2" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/30 uppercase">Total Tracked Volume</span>
                      <span className="text-xl font-bold text-white">{selectedMarket.volume}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                   <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6 flex items-center gap-2"><BarChart3 size={12}/> Platform Variance</h3>
                   <div className="space-y-4">
                      {Object.entries(selectedMarket.prices).map(([pId, price]) => {
                        const platform = PLATFORMS.find(p => p.id === pId);
                        return (
                          <div key={pId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{platform?.logo}</span>
                              <span className="text-xs font-bold text-white/60">{platform?.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${price}%` }} className="h-full bg-indigo-500" />
                              </div>
                              <span className="text-sm font-black text-white w-8 text-right">{price}%</span>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> Gemini Intelligence Deep Dive</h3>
                   <div className="bg-gradient-to-br from-fuchsia-600/10 to-indigo-600/10 border border-fuchsia-500/20 rounded-2xl p-6 min-h-[160px] relative overflow-hidden">
                      {isSpecificAnalyzing ? (
                         <div className="space-y-3">
                            <div className="h-2 w-full bg-white/10 animate-pulse rounded" />
                            <div className="h-2 w-4/5 bg-white/10 animate-pulse rounded" />
                            <div className="h-2 w-3/4 bg-white/10 animate-pulse rounded" />
                         </div>
                      ) : (
                        <p className="text-xs text-white/80 leading-relaxed font-medium">
                          {marketAiInsight || "Analyzing localized spreads..."}
                        </p>
                      )}
                      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                         <span className="text-[8px] font-bold text-white/20 uppercase">Model: Gemini 3 Pro</span>
                         <button className="text-[9px] font-black text-fuchsia-400 uppercase tracking-widest hover:text-white transition-colors">Regenerate Analysis</button>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleExecuteTrade}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-sm hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-white/5"
                >
                  Confirm Entry Point
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <CheckCircle2 size={24} />
            <p className="text-xs font-black uppercase tracking-widest">Trade Routed successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 w-full h-10 bg-black border-t border-white/5 z-50 flex items-center overflow-hidden">
        <div className="flex items-center gap-12 px-6 whitespace-nowrap animate-marquee">
          {[
            { l: "BTC/PM", v: "98,421", c: "up" },
            { l: "FED/CUT", v: "68%", c: "up" },
            { l: "ELECTION/FR", v: "42%", c: "down" },
            { l: "S&P/6200", v: "71%", c: "up" }
          ].map((tick, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase">
              <span className="text-white/20">{tick.l}</span>
              <span className="text-white">{tick.v}</span>
              {tick.c === 'up' ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
            </div>
          ))}
          {/* Duplicates... */}
        </div>
      </footer>
    </div>
  );
}

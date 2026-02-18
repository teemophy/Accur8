
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Bell, TrendingUp, Activity, BarChart3, 
  ShieldCheck, Zap, RefreshCcw, History, PieChart, 
  ArrowRight, ChevronRight, Trophy, Newspaper, 
  ArrowUpRight, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, MarketPrice } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis } from './services/gemini';

// Fix: Use MarketPrice type directly to solve index signature and type mismatch errors
const calculateConsensus = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

// Fix: Use MarketPrice type directly to solve index signature and type mismatch errors
const calculateArb = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  if (vals.length < 2) return 0;
  return Math.max(...vals) - Math.min(...vals);
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LIVE);
  const [search, setSearch] = useState("");
  const [ticker, setTicker] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulated real-time price ticks
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const marketData = useMemo(() => {
    return INITIAL_MARKETS.map(m => ({
      ...m,
      consensus: calculateConsensus(m.prices),
      arbGap: calculateArb(m.prices)
    })).filter(m => 
      m.question.toLowerCase().includes(search.toLowerCase()) || 
      m.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [ticker, search]);

  const handleAiInsights = async () => {
    setActiveTab(TabType.AI_INSIGHTS);
    if (!aiAnalysis) {
      setIsAnalyzing(true);
      try {
        const analysis = await getGeminiMarketAnalysis(marketData);
        setAiAnalysis(analysis);
      } catch (error) {
        console.error("AI Analysis failed", error);
        setAiAnalysis("Failed to load AI insights. Please check your network or API settings.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 1. TOP NAVIGATION */}
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
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              placeholder="Search 12,000+ markets..." 
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-[11px] w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <Bell size={18} className="text-white/40 hover:text-white cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 border border-white/20" />
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6 pb-24">
        
        {/* 2. LEFT SIDEBAR: Platform Infrastructure */}
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
                <div key={p.id} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">{p.logo}</span>
                    <div>
                      <p className="text-xs font-bold text-white leading-none mb-1">{p.name}</p>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-tighter italic">{p.delay} latency</p>
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
                  <p className="text-xs font-medium text-white/80 mt-2 group-hover:text-white transition-colors leading-relaxed">{n.title}</p>
                  <p className="text-[10px] text-white/30 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-indigo-400" />
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Market of the Day</h4>
            </div>
            <p className="text-sm font-bold text-white mb-2 leading-tight">Will the S&P 500 close above 6,200 this week?</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-white/40 uppercase font-black">Consensus</p>
                <p className="text-xl font-black text-indigo-400">71%</p>
              </div>
              <button className="text-[10px] font-black bg-white text-black px-3 py-1.5 rounded-lg hover:bg-indigo-400 hover:text-white transition-colors">TRADE</button>
            </div>
          </div>
        </aside>

        {/* 3. MAIN TERMINAL */}
        <main className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Header Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Consensus Index", val: "68.2", sub: "+1.2% Trend", icon: Activity, color: "#6366f1" },
              { label: "Aggregate Volume", val: "$44.2B", sub: "Last 30 Days", icon: BarChart3, color: "#10b981" },
              { label: "Regulatory Signal", val: "Stable", sub: "CFTC Outlook", icon: ShieldCheck, color: "#3b82f6" },
              { label: "Arb Gaps Found", val: "14", sub: "High Confidence", icon: Zap, color: "#f59e0b" },
            ].map((s, i) => (
              <div key={i} className="bg-[#11141d] border border-white/5 p-4 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <s.icon size={16} style={{ color: s.color }} className="opacity-70" />
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">{s.label}</span>
                </div>
                <div className="text-xl font-black text-white">{s.val}</div>
                <div className="text-[9px] text-white/30 font-bold mt-1 uppercase tracking-tighter">{s.sub}</div>
              </div>
            ))}
          </section>

          <AnimatePresence mode="wait">
            {activeTab === TabType.LIVE && (
              <motion.div 
                key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Arbitrage Alert Engine */}
                <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between group overflow-hidden relative gap-4">
                  <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 rounded-full blur-3xl -mr-8 -mt-8" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/40 animate-pulse">
                      <Zap size={20} className="text-white fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Arbitrage Alert</span>
                        <span className="bg-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white tracking-widest uppercase">7% Spread</span>
                      </div>
                      <p className="text-sm font-bold text-white tracking-tight">Price divergence detected on Fed Rate Decision between Kalshi & Polymarket.</p>
                    </div>
                  </div>
                  <button className="relative z-10 bg-white text-black font-black text-[10px] px-5 py-2.5 rounded-xl hover:bg-indigo-400 hover:text-white transition-all tracking-widest uppercase whitespace-nowrap">
                    Execute Trade
                  </button>
                </div>

                {/* Main Comparison Engine */}
                <div className="bg-[#11141d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/[0.01] gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><Activity size={18} className="text-indigo-500" /></div>
                      <div>
                        <h2 className="font-black text-sm tracking-widest uppercase">Cross-Platform Comparison Engine</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Real-time weighted consensus via PredictHub API</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                      <RefreshCcw size={12} className="text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Live Feed</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Market Event</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Consensus</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Polymarket</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Kalshi</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">PredictIt</th>
                          <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest text-left text-right">Arb Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.map((m) => (
                          <tr key={m.id} className="hover:bg-indigo-500/[0.03] transition-colors group">
                            <td className="px-6 py-5 text-sm border-t border-white/5">
                              <p className="text-[13px] font-black text-white group-hover:text-indigo-400 transition-colors leading-snug">{m.question}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[9px] bg-white/5 text-white/40 border border-white/5 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">{m.category}</span>
                                <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter flex items-center gap-1"><History size={10} /> {m.ends}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-white">{m.consensus}%</span>
                                <div className="h-6 w-1 bg-white/5 rounded-full overflow-hidden flex flex-col justify-end">
                                  <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${m.consensus}%` }}
                                    className="bg-indigo-500 w-full rounded-full" 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm border-t border-white/5 font-mono font-bold text-white/80">{m.prices.polymarket ?? '--'}¢</td>
                            <td className="px-6 py-5 text-sm border-t border-white/5 font-mono font-bold text-white/80">{m.prices.kalshi ?? '--'}¢</td>
                            <td className="px-6 py-5 text-sm border-t border-white/5 font-mono font-bold text-white/80">{m.prices.predictit ?? '--'}¢</td>
                            <td className="px-6 py-5 text-sm border-t border-white/5 text-right">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${m.arbGap! > 5 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-white/30 border-white/10'}`}>
                                {m.arbGap! > 5 && <Zap size={10} className="fill-emerald-500" />} {m.arbGap}% GAP
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 text-center border-t border-white/5 bg-white/[0.01]">
                    <button className="text-[10px] font-black text-white/20 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 mx-auto">
                      Load All Open Markets <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.AI_INSIGHTS && (
              <motion.div 
                key="ai-insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#11141d] border border-white/10 rounded-3xl p-8 min-h-[400px] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-32 bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-fuchsia-600 rounded-2xl shadow-lg shadow-fuchsia-600/40">
                    <Sparkles size={24} className="text-white fill-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase">Gemini Market Intelligence</h2>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">AI analysis of current spreads and market sentiment</p>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-white/5 animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-white/5 animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-sm">
                    {aiAnalysis ? (
                      <div className="whitespace-pre-wrap font-medium">{aiAnalysis}</div>
                    ) : (
                      <p>Click "AI Insights" to generate a real-time analysis of the prediction landscape.</p>
                    )}
                  </div>
                )}

                <div className="mt-12 flex justify-end">
                  <button 
                    onClick={() => { setAiAnalysis(null); handleAiInsights(); }}
                    className="bg-white/5 border border-white/10 text-white font-black text-[10px] px-6 py-3 rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    Refresh Analysis
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.ACCURACY && (
              <motion.div 
                key="accuracy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-[#11141d] border border-white/10 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Trophy className="text-amber-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Accuracy Leaderboard</h3>
                  </div>
                  <div className="space-y-10">
                    {PLATFORMS.slice().sort((a,b) => b.accuracy - a.accuracy).map((p, i) => (
                      <div key={p.id} className="relative">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-black flex items-center gap-3">
                            <span className="text-white/10 font-black italic">#0{i+1}</span>
                            {p.logo} {p.name}
                          </span>
                          <span className="text-sm font-black text-white">{p.accuracy}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${p.accuracy}%` }}
                            transition={{ duration: 1 }}
                            className="h-full rounded-full" 
                            style={{ backgroundColor: p.color }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-indigo-600/5 border border-indigo-500/10 p-12 rounded-3xl text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                    <History size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-3 tracking-tighter uppercase">Historical Resolution Archive</h3>
                  <p className="text-xs text-white/40 leading-relaxed max-w-xs mb-8">
                    Analyze every resolved prediction market from 2018–2026. Filter by accuracy, Brier Score, and volume.
                  </p>
                  <button className="bg-white text-black text-[10px] font-black px-6 py-3 rounded-xl hover:bg-indigo-400 hover:text-white transition-all tracking-[0.2em] uppercase shadow-xl shadow-white/5">
                    Search Archive
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.PORTFOLIO && (
              <motion.div 
                key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-900/20 to-black border border-white/5 p-16 rounded-[3rem] text-center relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <PieChart size={40} className="text-indigo-500" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Unified Terminal Tracker</h2>
                  <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed text-sm font-medium">
                    Consolidate your P&L from Polymarket, Kalshi, and PredictIt. Manage open positions and hedge across platforms from one interface.
                  </p>
                  <div className="flex flex-col md:flex-row justify-center gap-4">
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase">
                      Sync Accounts <ArrowRight size={18} />
                    </button>
                    <button className="bg-white/5 border border-white/10 text-white font-black px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-sm tracking-widest uppercase">
                      Watch Demo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* FOOTER DATA TICKER */}
      <footer className="fixed bottom-0 left-0 w-full h-10 bg-black border-t border-white/5 backdrop-blur-md z-50 flex items-center overflow-hidden">
        <div className="flex items-center gap-12 px-6 whitespace-nowrap animate-marquee">
          {[
            { l: "BTC/PM", v: "98,421", c: "up" },
            { l: "FED/CUT", v: "68%", c: "up" },
            { l: "ELECTION/FR", v: "42%", c: "down" },
            { l: "S&P/6200", v: "71%", c: "up" },
            { l: "MARS/LAND", v: "14%", c: "down" },
            { l: "ETH/PM", v: "3,142", c: "up" },
            { l: "RECESSION/26", v: "34%", c: "up" },
            { l: "STARSHIP/ORBIT", v: "78%", c: "down" },
          ].map((tick, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em]">
              <span className="text-white/20">{tick.l}</span>
              <span className="text-white">{tick.v}</span>
              {tick.c === 'up' ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
            </div>
          ))}
          {/* Duplicate for seamless scrolling */}
          {[
            { l: "BTC/PM", v: "98,421", c: "up" },
            { l: "FED/CUT", v: "68%", c: "up" },
            { l: "ELECTION/FR", v: "42%", c: "down" },
            { l: "S&P/6200", v: "71%", c: "up" },
            { l: "MARS/LAND", v: "14%", c: "down" },
            { l: "ETH/PM", v: "3,142", c: "up" },
            { l: "RECESSION/26", v: "34%", c: "up" },
            { l: "STARSHIP/ORBIT", v: "78%", c: "down" },
          ].map((tick, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em]">
              <span className="text-white/20">{tick.l}</span>
              <span className="text-white">{tick.v}</span>
              {tick.c === 'up' ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, Bell, TrendingUp, Activity, BarChart3, 
  Zap, RefreshCcw, History, Newspaper, 
  ArrowUpRight, ArrowDownRight, Sparkles, SlidersHorizontal, CheckCircle2,
  X, ExternalLink, Filter, ArrowUpDown, Globe, Shield, Info, Link2, Code, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, MarketPrice } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from './services/gemini';

// --- Utility Functions ---
const calculateConsensus = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  return vals.length === 0 ? 0 : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

const calculateArb = (prices: MarketPrice) => {
  const vals = Object.values(prices).filter((v): v is number => v !== undefined);
  return vals.length < 2 ? 0 : Math.max(...vals) - Math.min(...vals);
};

// --- Sub-Components ---

const TableHeaderTooltip = ({ title, description }: { title: string, description: string }) => (
  <div className="relative flex items-center gap-1.5 cursor-help tooltip-container">
    <span>{title}</span>
    <Info size={10} className="text-white/20" />
    <span className="tooltip-text">{description}</span>
  </div>
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
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-slate-100 group-hover:text-white transition-colors leading-tight">{market.question}</span>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{market.category}</span>
          <span className="text-[9px] text-white/20 font-bold uppercase flex items-center gap-1"><History size={10} /> {market.ends}</span>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <span className="text-sm font-black text-white">{market.consensus}%</span>
        <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-indigo-500" style={{ width: `${market.consensus}%` }} />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-center font-mono text-[11px] font-bold text-white/40">{market.prices.polymarket ?? '--'}¢</td>
    <td className="px-6 py-4 text-center font-mono text-[11px] font-bold text-white/40">{market.prices.kalshi ?? '--'}¢</td>
    <td className="px-6 py-4 text-center font-mono text-[11px] font-bold text-white/40">{market.prices.predictit ?? '--'}¢</td>
    <td className="px-6 py-4 text-right">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${market.arbGap! >= arbThreshold ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-white/5 text-white/20 border-white/10'}`}>
        {market.arbGap! >= arbThreshold && <Zap size={10} className="fill-emerald-500" />}
        {market.arbGap}%
      </div>
    </td>
  </tr>
));

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.LIVE);
  const [search, setSearch] = useState("");
  const [arbThreshold, setArbThreshold] = useState(5);
  const [ticker, setTicker] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketAiInsight, setMarketAiInsight] = useState<string | null>(null);
  const [isSpecificAnalyzing, setIsSpecificAnalyzing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'question' | 'consensus' | 'arbGap'; direction: 'asc' | 'desc' }>({ key: 'arbGap', direction: 'desc' });
  const [executingTrade, setExecutingTrade] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Background ticker for price simulation
  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 8000);
    return () => clearInterval(timer);
  }, []);

  const marketData = useMemo(() => {
    let data = INITIAL_MARKETS.map(m => {
      const prices = { ...m.prices };
      if (ticker % 4 === 0) {
        Object.keys(prices).forEach(key => {
          const k = key as keyof MarketPrice;
          if (prices[k]) (prices[k] as number) += Math.floor(Math.random() * 2) - 0.5;
        });
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
      return sortConfig.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [ticker, search, sortConfig]);

  const handleExecuteTrade = useCallback(() => {
    setExecutingTrade(true);
    setTimeout(() => {
      setExecutingTrade(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  }, []);

  const handleAiInsights = async () => {
    setActiveTab(TabType.AI_INSIGHTS);
    if (!aiAnalysis) {
      setIsAnalyzing(true);
      try {
        const analysis = await getGeminiMarketAnalysis(marketData);
        setAiAnalysis(analysis);
      } catch (error) {
        setAiAnalysis("Service temporarily offline. Retrying...");
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
      setMarketAiInsight("Deep scan unavailable for this asset.");
    } finally {
      setIsSpecificAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080f] text-slate-200 selection:bg-indigo-500/40 pb-12">
      {/* Navigation */}
      <nav className="h-16 border-b border-white/5 bg-[#06080f]/95 backdrop-blur-xl sticky top-0 z-[100] px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveTab(TabType.LIVE)}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300 shadow-xl shadow-indigo-600/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase italic flex items-center gap-1">
              Predict<span className="text-indigo-500">Hub</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 not-italic ml-1 tracking-normal">TERMINAL</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {[TabType.LIVE, TabType.ACCURACY, TabType.INTEGRATE].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-[0.15em] ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                {tab === TabType.LIVE ? 'Market Table' : tab === TabType.INTEGRATE ? 'API Partners' : tab}
              </button>
            ))}
            <button 
              onClick={handleAiInsights}
              className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-[0.15em] flex items-center gap-2 ${activeTab === TabType.AI_INSIGHTS ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/20' : 'text-fuchsia-400/60 hover:text-fuchsia-400 hover:bg-white/5'}`}
            >
              <Sparkles size={12} /> AI Intelligence
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text" placeholder="Search markets (e.g. BTC, SpaceX)..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[11px] w-72 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/20"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-5">
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <Bell size={18} className="text-white/40" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#06080f]" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-fuchsia-500 border border-white/20 rotate-45" />
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <section className="glass-panel rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe size={12} className="text-indigo-400" /> Tracked Sources
              </h3>
              <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" /> Real-time
              </span>
            </div>
            <div className="space-y-3">
              {PLATFORMS.map(p => <PlatformWidget key={p.id} platform={p} />)}
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5 shadow-2xl">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-5 flex items-center justify-between">
              Terminal Feed <Newspaper size={12} className="text-fuchsia-400" />
            </h3>
            <div className="space-y-6">
              {NEWS_FEED.map(n => (
                <div key={n.id} className="group cursor-pointer border-l-2 border-transparent hover:border-indigo-500 pl-3 transition-all">
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/5 px-2 py-0.5 rounded uppercase tracking-tighter">{n.tag}</span>
                  <p className="text-[12px] font-bold text-white/90 mt-2 leading-tight group-hover:text-white transition-colors">{n.title}</p>
                  <p className="text-[10px] text-white/20 mt-1.5 font-medium">{n.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-2xl p-5 shadow-2xl bg-indigo-600/5 border-indigo-500/20">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Partner with Us</h3>
            <p className="text-[11px] text-white/60 leading-relaxed mb-4">Are you a prediction platform? Integrate your order book with PredictHub to reach 50k+ institutional traders.</p>
            <button 
              onClick={() => setActiveTab(TabType.INTEGRATE)}
              className="w-full bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all border border-white/10"
            >
              Request API Keys
            </button>
          </section>
        </aside>

        {/* Center Content */}
        <section className="col-span-12 lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === TabType.LIVE && (
              <motion.div 
                key="grid" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Onboarding Banner */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent">
                  <div className="flex items-center gap-4 mb-2">
                    <Info size={18} className="text-indigo-400" />
                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">How to read this terminal</h4>
                  </div>
                  <p className="text-[13px] text-white/70 leading-relaxed">
                    PredictHub aggregates prices from <span className="text-white font-bold">Poly, Kalshi, and PredictIt</span>. 
                    A high <span className="text-indigo-400 font-bold">Price Difference (Spread Gap)</span> means platforms disagree on the outcome, creating a 
                    <span className="text-emerald-500 font-bold"> Profit Opportunity</span> for you to buy low on one platform and sell high on another.
                  </p>
                </div>

                {/* Market Table */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-500/10 rounded-lg"><BarChart3 size={18} className="text-indigo-400" /></div>
                      <div>
                        <h2 className="font-black text-[11px] tracking-[0.2em] uppercase text-white/90">Market Aggregator</h2>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">Aggregating {marketData.length} Top Markets</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 z-10 bg-[#0a0d14]">
                        <tr className="bg-white/[0.02]">
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Market Identity</th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                             <TableHeaderTooltip title="Avg. Crowd Prediction" description="The average probability percentage across all platforms. Usually the most accurate price." />
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-center">
                             <TableHeaderTooltip title="Poly" description="Polymarket Price (DeFi based). 1¢ = 1% probability." />
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-center">
                             <TableHeaderTooltip title="Kalshi" description="Kalshi Price (US Regulated). 1¢ = 1% probability." />
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-center">
                             <TableHeaderTooltip title="PredIt" description="PredictIt Price. 1¢ = 1% probability." />
                          </th>
                          <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] text-right">
                             <TableHeaderTooltip title="Price Difference" description="The gap between the cheapest and most expensive platform. Higher gap = More Profit Opportunity." />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.map((m) => (
                          <MarketRow 
                            key={m.id} 
                            market={m} 
                            isSelected={selectedMarket?.id === m.id}
                            arbThreshold={arbThreshold}
                            onClick={() => handleMarketSelect(m)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.INTEGRATE && (
              <motion.div 
                key="integrate" 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-12 border border-indigo-500/20"
              >
                <div className="flex items-center gap-6 mb-12">
                  <div className="p-4 bg-indigo-600 rounded-2xl"><Code size={32} className="text-white" /></div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Partner API Integration</h2>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em]">Developer Portal v1.0 • Institutional Access</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-indigo-500/30 transition-all group">
                      <Link2 className="text-indigo-400 mb-6 group-hover:scale-110 transition-transform" size={28} />
                      <h4 className="text-lg font-bold text-white mb-3 italic uppercase">Connect Your Platform</h4>
                      <p className="text-sm text-white/60 leading-relaxed">Submit your WebSocket or REST endpoints to have your order book aggregated on our terminal.</p>
                      <ul className="mt-6 space-y-3 text-[11px] font-black text-white/30 uppercase tracking-widest">
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-400" /> Instant Exposure</li>
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-400" /> Arbitrage Routing</li>
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-400" /> Verified Data Label</li>
                      </ul>
                   </div>
                   <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-fuchsia-500/30 transition-all group">
                      <Shield className="text-fuchsia-400 mb-6 group-hover:scale-110 transition-transform" size={28} />
                      <h4 className="text-lg font-bold text-white mb-3 italic uppercase">Data Licensing</h4>
                      <p className="text-sm text-white/60 leading-relaxed">Stream our aggregated "Consensus Engine" data back into your own UI to help your users trade better.</p>
                      <ul className="mt-6 space-y-3 text-[11px] font-black text-white/30 uppercase tracking-widest">
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-400" /> Sub-100ms Latency</li>
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-400" /> Cross-Chain Feeds</li>
                         <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-fuchsia-400" /> AI-Ready Metadata</li>
                      </ul>
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5">
                   <Mail className="text-white/20 mb-6" size={48} />
                   <h3 className="text-xl font-black text-white mb-4 italic uppercase">Ready to scale your platform?</h3>
                   <p className="text-white/40 text-center mb-8 max-w-md">Our team reviews all integration requests within 24 hours. Connect with our ecosystem and unlock massive liquidity.</p>
                   <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                      Contact Integration Team
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === TabType.AI_INSIGHTS && (
              <motion.div 
                key="ai" 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-12 min-h-[500px] border border-fuchsia-500/10"
              >
                <div className="flex items-center gap-5 mb-10">
                  <div className="p-4 bg-fuchsia-600 rounded-2xl shadow-xl shadow-fuchsia-600/20"><Sparkles size={28} className="text-white" /></div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">AI Market Summary</h2>
                    <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-[0.3em]">Simplified Intelligence • Gemini 3 Flash</p>
                  </div>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-4 bg-white/5 animate-pulse rounded-full`} style={{ width: `${100 - (i * 10)}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-white/80 leading-relaxed text-base whitespace-pre-wrap font-medium font-sans prose prose-invert max-w-none">
                    {aiAnalysis || "Click the button below to have AI scan the 20+ markets and explain where the best profit opportunities are hiding in simple language."}
                  </div>
                )}

                {!aiAnalysis && !isAnalyzing && (
                  <button 
                    onClick={handleAiInsights}
                    className="mt-8 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-fuchsia-600/10 active:scale-95"
                  >
                    Generate AI Briefing
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Detail Drawer (Simplified) */}
      <AnimatePresence>
        {selectedMarket && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setSelectedMarket(null)} 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]" 
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0a0d14] border-l border-white/10 z-[160] shadow-[0_0_100px_rgba(0,0,0,0.8)] p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-12">
                <button onClick={() => setSelectedMarket(null)} className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-indigo-600/20 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/30 uppercase tracking-[0.2em]">{selectedMarket.category}</span>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-tight italic uppercase">{selectedMarket.question}</h2>
                  <div className="grid grid-cols-2 gap-6 mt-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Crowd Consensus</span>
                      <span className="text-4xl font-black text-indigo-500">{selectedMarket.consensus}%</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Market Volume</span>
                      <span className="text-xl font-bold text-white mt-2 block">{selectedMarket.volume}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8 flex items-center gap-3"><Shield size={14} className="text-indigo-400" /> Platform Price Comparison</h3>
                   <div className="space-y-6">
                      {Object.entries(selectedMarket.prices).map(([pId, price]) => {
                        const platform = PLATFORMS.find(p => p.id === pId);
                        return (
                          <div key={pId} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-white/60 flex items-center gap-2">
                                <span className="text-base grayscale">{platform?.logo}</span> {platform?.name}
                              </span>
                              <span className="text-white font-black">{price}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${price}%` }} className="h-full bg-indigo-500/60" />
                            </div>
                          </div>
                        );
                      })}
                   </div>
                   <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[11px] text-white/40 leading-relaxed italic">
                        Tip: If one price is significantly higher than others, buy on the cheaper platform.
                      </p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14}/> Expert AI Analysis</h3>
                   <div className="bg-gradient-to-br from-fuchsia-600/10 to-indigo-600/10 border border-fuchsia-500/20 rounded-2xl p-8 min-h-[160px] shadow-2xl">
                      {isSpecificAnalyzing ? (
                         <div className="space-y-4">
                            <div className="h-2 w-full bg-white/10 animate-pulse rounded-full" />
                            <div className="h-2 w-5/6 bg-white/10 animate-pulse rounded-full" />
                         </div>
                      ) : (
                        <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                          {marketAiInsight || "AI is scanning for the best trade setup..."}
                        </p>
                      )}
                   </div>
                </div>

                <button 
                  onClick={handleExecuteTrade}
                  className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.25em] text-[11px] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95"
                >
                  Quick Trade
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ticker Tape */}
      <footer className="fixed bottom-0 left-0 w-full h-10 bg-black/90 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center overflow-hidden">
        <div className="flex items-center gap-16 px-6 whitespace-nowrap animate-marquee">
          {[
            { l: "BTC/USDT", v: "102,540", c: "up" },
            { l: "SOL/WETH", v: "248.1", c: "down" },
            { l: "S&P/PRED", v: "6102", c: "up" },
            { l: "ETH/GAS", v: "12 Gwei", c: "down" },
            { l: "GPT5/PROB", v: "72%", c: "up" },
            { l: "FED/CUT/PROB", v: "64%", c: "down" }
          ].map((tick, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase">
              <span className="text-white/30 tracking-widest">{tick.l}</span>
              <span className="text-white">{tick.v}</span>
              {tick.c === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
            </div>
          ))}
          {/* Duplicate for seamless scrolling */}
          {[
            { l: "BTC/USDT", v: "102,540", c: "up" },
            { l: "SOL/WETH", v: "248.1", c: "down" },
            { l: "S&P/PRED", v: "6102", c: "up" },
            { l: "ETH/GAS", v: "12 Gwei", c: "down" },
            { l: "GPT5/PROB", v: "72%", c: "up" },
            { l: "FED/CUT/PROB", v: "64%", c: "down" }
          ].map((tick, i) => (
            <div key={i+10} className="flex items-center gap-3 text-[10px] font-black uppercase">
              <span className="text-white/30 tracking-widest">{tick.l}</span>
              <span className="text-white">{tick.v}</span>
              {tick.c === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
            </div>
          ))}
        </div>
      </footer>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400/30"
          >
            <CheckCircle2 size={24} className="animate-bounce" />
            <p className="text-[11px] font-black uppercase tracking-widest">Trade Routed Successfully</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
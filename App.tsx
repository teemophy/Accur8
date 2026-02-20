
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, TrendingUp, Activity, BarChart3, 
  Zap, History, Sparkles, CheckCircle2,
  X, ExternalLink, Filter, Globe, Shield, Link2, Code, BrainCircuit, Menu, ChevronRight, Send, Star, ArrowRight, Lock, Target, TrendingDown, MessageSquare, Clock, Share2, Twitter, Copy, Plus, Wallet, Eye, Info, Trash2, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform, Position } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from './services/gemini';

// --- Utility: Sparkline Component ---
const Sparkline = ({ color = "#6366f1" }: { color?: string }) => {
  const points = useMemo(() => Array.from({ length: 8 }, () => Math.floor(Math.random() * 20) + 5), []);
  const path = `M ${points.map((p, i) => `${i * 10},${p}`).join(' L ')}`;
  return (
    <svg width="60" height="25" className="opacity-50 group-hover:opacity-100 transition-opacity">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// --- Components ---

const HeroSearch = ({ onSearch }: { onSearch: (q: string) => void }) => (
  <div className="relative w-full max-w-3xl mx-auto py-8 md:py-12 px-4 text-center">
    <h1 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 text-white leading-none">
      Search the <span className="ph-gradient-text">Future.</span>
    </h1>
    <p className="text-white/40 text-sm md:text-lg mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed">
      Universal search engine for every prediction market on earth. Compare odds across 10+ platforms in real-time.
    </p>
    <div className="relative group">
      <div className="absolute inset-0 bg-indigo-600/20 blur-2xl rounded-full group-hover:bg-indigo-600/30 transition-all" />
      <div className="relative flex items-center bg-[#11141d] border border-white/10 rounded-full md:rounded-[2rem] p-1.5 md:p-2 focus-within:border-indigo-500 transition-all shadow-2xl">
        <Search className="ml-4 md:ml-5 text-white/20 hidden sm:block" size={20} />
        <input 
          type="text" 
          placeholder="Search any event..." 
          className="bg-transparent border-none outline-none flex-1 px-4 text-white placeholder:text-white/20 font-medium text-sm md:text-base"
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-5 md:px-8 py-2.5 md:py-3 rounded-full uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
          Search
        </button>
      </div>
    </div>
  </div>
);

const MarketDetailModal = ({ market, isOpen, onClose, onWatch, isWatched, balance, onTrade }: { market: Market | null, isOpen: boolean, onClose: () => void, onWatch: (id: string) => void, isWatched: boolean, balance: number, onTrade: (side: 'Yes' | 'No', amount: number) => void }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTradePanel, setShowTradePanel] = useState(false);
  const [tradeSide, setTradeSide] = useState<'Yes' | 'No'>('Yes');
  const [tradeAmount, setTradeAmount] = useState<string>("100");

  useEffect(() => {
    if (isOpen && market) {
      setLoading(true);
      getGeminiSpecificMarketDeepDive(market)
        .then(setAnalysis)
        .finally(() => setLoading(false));
    } else {
      setAnalysis(null);
      setShowTradePanel(false);
    }
  }, [isOpen, market]);

  if (!market) return null;

  const handleExecute = () => {
    const amt = parseFloat(tradeAmount);
    if (isNaN(amt) || amt <= 0) return alert("Enter a valid amount");
    if (amt > balance) return alert("Insufficient virtual balance");
    onTrade(tradeSide, amt);
    setShowTradePanel(false);
  };

  const currentPrice = tradeSide === 'Yes' ? (market.consensus || 50) : (100 - (market.consensus || 50));
  const estimatedShares = Math.floor(parseFloat(tradeAmount || "0") / (currentPrice / 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl ph-panel overflow-hidden bg-[#0c0e16] border-indigo-500/20 shadow-3xl">
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 block">{market.category}</span>
                  <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{market.question}</h2>
                </div>
                <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors bg-white/5 rounded-full"><X size={20}/></button>
              </div>

              {!showTradePanel ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="ph-panel p-4 bg-white/[0.02]">
                      <p className="text-[8px] font-black text-white/20 uppercase mb-1">Volume</p>
                      <p className="text-lg font-black text-white">{market.volume}</p>
                    </div>
                    <div className="ph-panel p-4 bg-white/[0.02]">
                      <p className="text-[8px] font-black text-white/20 uppercase mb-1">Consensus</p>
                      <p className="text-lg font-black text-indigo-400">{market.consensus}%</p>
                    </div>
                    <div className="ph-panel p-4 bg-white/[0.02]">
                      <p className="text-[8px] font-black text-white/20 uppercase mb-1">Ends In</p>
                      <p className="text-lg font-black text-white/60">{market.ends}</p>
                    </div>
                  </div>

                  <div className="mb-8 p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-indigo-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Gemini Intelligence Report</h4>
                    </div>
                    {loading ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-3 bg-white/5 rounded w-full" />
                        <div className="h-3 bg-white/5 rounded w-5/6" />
                        <div className="h-3 bg-white/5 rounded w-4/6" />
                      </div>
                    ) : (
                      <p className="text-sm text-white/70 leading-relaxed font-medium">
                        {analysis || "No real-time data divergence detected."}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => onWatch(market.id)}
                      className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all border ${isWatched ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                    >
                      <Star size={16} fill={isWatched ? "white" : "none"} />
                      {isWatched ? 'Watched' : 'Add to Watchlist'}
                    </button>
                    <button onClick={() => setShowTradePanel(true)} className="flex-1 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-xl active:scale-95">
                      Execute Paper Trade
                    </button>
                  </div>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTradeSide('Yes')}
                      className={`py-6 rounded-2xl border-2 transition-all text-sm font-black uppercase tracking-widest ${tradeSide === 'Yes' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                      Buy Yes @ {market.consensus}%
                    </button>
                    <button 
                      onClick={() => setTradeSide('No')}
                      className={`py-6 rounded-2xl border-2 transition-all text-sm font-black uppercase tracking-widest ${tradeSide === 'No' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                      Buy No @ {100 - (market.consensus || 50)}%
                    </button>
                  </div>

                  <div className="ph-panel p-6 bg-white/[0.02] border-white/5">
                    <div className="flex justify-between items-center mb-4">
                       <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Investment Amount ($)</label>
                       <span className="text-[10px] font-black text-indigo-400 uppercase">Max: ${balance.toLocaleString()}</span>
                    </div>
                    <input 
                      type="number" 
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-white/10 py-2 text-2xl font-black text-white outline-none focus:border-indigo-500 transition-colors"
                      placeholder="0.00"
                    />
                    <div className="flex justify-between mt-6 text-[11px] font-bold text-white/40">
                       <span>Estimated Shares</span>
                       <span className="text-white">{estimatedShares}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-[11px] font-bold text-white/40">
                       <span>Potential Payout if Win</span>
                       <span className="text-emerald-400">${(estimatedShares * 1).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setShowTradePanel(false)} className="flex-1 py-4 bg-white/5 text-white/60 rounded-xl text-xs font-black uppercase hover:bg-white/10 transition-all">Cancel</button>
                    <button onClick={handleExecute} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                      Confirm Purchase
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const LiveOddsFeed = ({ markets, onMarketClick, watchlist, onWatch }: { markets: Market[], onMarketClick: (m: Market) => void, watchlist: string[], onWatch: (id: string) => void }) => (
  <div className="ph-panel overflow-hidden border-white/5 bg-black/10 shadow-2xl">
    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
      <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 flex items-center gap-2">
         <Shield size={12} className="text-indigo-500"/> Price Comparison Matrix
      </h2>
      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest hidden sm:block">Click any row for Deep Intelligence</div>
    </div>
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left min-w-[750px]">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest w-12 text-center"></th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Market Entity</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Platforms</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Visual Trend</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Consensus</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center w-24">Savings Gap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {markets.map(m => (
            <tr key={m.id} onClick={() => onMarketClick(m)} className="hover:bg-indigo-500/[0.03] cursor-pointer transition-all group">
              <td className="px-4 md:px-6 py-4 text-center" onClick={(e) => { e.stopPropagation(); onWatch(m.id); }}>
                <Star size={14} className={`transition-colors ${watchlist.includes(m.id) ? 'text-indigo-400' : 'text-white/10 group-hover:text-white/30'}`} fill={watchlist.includes(m.id) ? "currentColor" : "none"} />
              </td>
              <td className="px-4 md:px-6 py-4">
                <p className="text-[12px] md:text-[14px] font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{m.question}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[8px] font-black uppercase text-indigo-400/60 tracking-widest">{m.category}</span>
                  <span className="text-[8px] font-bold text-white/20 uppercase flex items-center gap-1"><History size={10}/> {m.ends}</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                 <div className="flex justify-center gap-1.5">
                    {Object.entries(m.prices).map(([p, v]) => {
                      const isBest = v === Math.min(...Object.values(m.prices).filter((val): val is number => val !== undefined));
                      return (
                        <div key={p} className={`relative w-8 h-8 rounded-lg border flex flex-col items-center justify-center transition-all ${isBest ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                          <span className={`text-[8px] font-black uppercase leading-none ${isBest ? 'text-indigo-400' : 'text-white/40'}`}>{p[0]}</span>
                          <span className={`text-[10px] font-bold mt-0.5 ${isBest ? 'text-white' : 'text-white/60'}`}>{v}%</span>
                          {isBest && (
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-[6px] font-black px-1 py-0.5 rounded shadow-lg animate-pulse">BEST</div>
                          )}
                        </div>
                      );
                    })}
                 </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-center">
                <div className="flex justify-center"><Sparkline color={m.arbGap! >= 4 ? '#6366f1' : '#475569'} /></div>
              </td>
              <td className="px-4 md:px-6 py-4 text-center">
                <span className="text-xs md:text-sm font-black text-white/80">{m.consensus}%</span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${m.arbGap! >= 4 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}>
                   {m.arbGap}%
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PortfolioSection = ({ balance, positions, onDeletePosition }: { balance: number, positions: Position[], onDeletePosition: (id: string) => void }) => {
  const totalValue = positions.reduce((acc, pos) => {
    const market = INITIAL_MARKETS.find(m => m.id === pos.marketId);
    const consensus = market?.consensus || 50;
    const currentPrice = pos.side === 'Yes' ? (consensus / 100) : ((100 - consensus) / 100);
    return acc + (pos.shares * currentPrice);
  }, 0);

  const profitLoss = (totalValue + balance) - 10000;
  const isProfit = profitLoss >= 0;

  return (
    <div className="ph-panel overflow-hidden bg-gradient-to-br from-[#11141d] to-[#0a0c14] border-indigo-500/10">
      <div className="p-6 md:p-8 border-b border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
              <Wallet size={12}/> Active Simulation
            </h4>
            <p className="text-3xl font-black text-white italic tracking-tighter">${(balance + totalValue).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {isProfit ? '+' : ''}{((profitLoss / 10000) * 100).toFixed(2)}%
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Available Cash</span>
              <span className="text-xs font-bold text-white">${balance.toLocaleString()}</span>
           </div>
           <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Open Positions</span>
              <span className="text-xs font-bold text-white">{positions.length}</span>
           </div>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto scrollbar-hide divide-y divide-white/5">
        {positions.length > 0 ? positions.map(pos => {
          const market = INITIAL_MARKETS.find(m => m.id === pos.marketId);
          const consensus = market?.consensus || 50;
          const currentPrice = pos.side === 'Yes' ? (consensus / 100) : ((100 - consensus) / 100);
          const currentValue = pos.shares * currentPrice;
          const posPL = currentValue - pos.amountSpent;
          const posIsProfit = posPL >= 0;

          return (
            <div key={pos.id} className="p-5 hover:bg-white/[0.02] transition-colors group relative">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${pos.side === 'Yes' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {pos.side} • {pos.shares} Shares
                </span>
                <button onClick={() => onDeletePosition(pos.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-rose-400 transition-all">
                  <Trash2 size={12}/>
                </button>
              </div>
              <p className="text-[11px] font-bold text-white line-clamp-1 mb-3">{pos.marketQuestion}</p>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-black text-white/20 uppercase block">Entry: ${(pos.entryPrice * 100).toFixed(0)}¢</span>
                  <span className="text-[8px] font-black text-indigo-400 uppercase block">Curr: ${(currentPrice * 100).toFixed(0)}¢</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-white block">${currentValue.toFixed(2)}</span>
                  <span className={`text-[9px] font-bold flex items-center justify-end gap-1 ${posIsProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {posIsProfit ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                    {posIsProfit ? '+' : ''}{posPL.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="p-12 text-center">
             <Lock size={24} className="text-white/10 mx-auto mb-4" />
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">No active trades</p>
          </div>
        )}
      </div>
      
      {positions.length > 0 && (
        <div className="p-4 bg-white/[0.02] border-t border-white/5">
           <button onClick={() => alert("Simulation settlement occurs weekly.")} className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 transition-all">
             View Full Trade Ledger
           </button>
        </div>
      )}
    </div>
  );
};

// Added optional key to props interface to resolve TS error on line 727
const PlatformCard = ({ platform }: { platform: Platform, key?: React.Key }) => (
  <div className="ph-panel p-6 bg-gradient-to-br from-white/[0.02] to-transparent border-white/5 hover:border-indigo-500/30 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {platform.logo}
        </div>
        <div>
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{platform.name}</h3>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{platform.type}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end mb-1">
          {platform.usFriendly ? <Globe size={10} className="text-emerald-400" /> : <Shield size={10} className="text-red-400" />}
          <span className={`text-[8px] font-black uppercase ${platform.usFriendly ? 'text-emerald-400' : 'text-red-400'}`}>
            {platform.usFriendly ? 'US Friendly' : 'Global Only'}
          </span>
        </div>
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{platform.isRealMoney ? 'Real Money' : 'Play Money'}</span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
        <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Accuracy</span>
        <span className="text-sm font-black text-white">{platform.accuracy}%</span>
      </div>
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
        <span className="text-[8px] font-black text-white/20 uppercase block mb-1">Volume</span>
        <span className="text-sm font-black text-indigo-400">{platform.volume}</span>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
          <CheckCircle2 size={10} className="text-emerald-400" /> Key Strengths
        </h4>
        <div className="flex flex-wrap gap-2">
          {platform.pros.map((pro, i) => (
            <span key={i} className="px-2 py-1 bg-emerald-500/5 text-emerald-400 text-[9px] font-bold rounded-lg border border-emerald-500/10">{pro}</span>
          ))}
        </div>
      </div>
      <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/5 flex items-center justify-center gap-2">
        View Markets <ExternalLink size={12} />
      </button>
    </div>
  </div>
);

const AccuracyLeaderboard = () => {
  const sortedPlatforms = useMemo(() => [...PLATFORMS].sort((a, b) => b.accuracy - a.accuracy), []);

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">F5 Leaderboard</h1>
        <p className="text-white/40 leading-relaxed">Dynamic accuracy scoring based on Brier coefficients and historical resolution data.</p>
      </div>

      <div className="ph-panel overflow-hidden border-white/5 bg-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center w-16">Rank</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Platform</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Accuracy Rating</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Brier Score</th>
                <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedPlatforms.map((p, idx) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-6 text-center">
                    <span className={`text-sm font-black italic ${idx === 0 ? 'text-indigo-400' : 'text-white/20'}`}>#{(idx + 1).toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.logo}</span>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{p.name}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{p.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-black text-white">{p.accuracy}%</span>
                      <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${p.accuracy}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-bold text-white/60">{p.brierScore}</span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${idx < 2 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}>
                      {idx < 2 ? 'ULTIMATE' : idx < 4 ? 'RELIABLE' : 'STABLE'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PlatformComparisonMatrix = () => {
  const categories = [
    { key: 'liquidity', label: 'Liquidity', icon: <Droplets size={12} className="text-blue-400" /> },
    { key: 'variety', label: 'Market Variety', icon: <Layers size={12} className="text-purple-400" /> },
    { key: 'fees', label: 'Fee Score', icon: <Plus size={12} className="text-emerald-400" /> },
    { key: 'ux', label: 'UX/Design', icon: <Sparkles size={12} className="text-indigo-400" /> },
    { key: 'regulatory', label: 'Regulatory', icon: <Shield size={12} className="text-orange-400" /> },
    { key: 'beginner', label: 'Entry Level', icon: <Eye size={12} className="text-pink-400" /> }
  ];

  return (
    <div className="space-y-8">
      <div className="max-w-2xl px-2">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Comparison Matrix</h1>
        <p className="text-white/40 leading-relaxed">Cross-indexed ratings across the six core pillars of prediction trading. Objective data gathered from 250k+ data points.</p>
      </div>

      <div className="ph-panel overflow-hidden border-white/5 bg-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-8 text-[10px] font-black text-white/40 uppercase tracking-widest sticky left-0 bg-[#11141d] z-10 w-48 border-r border-white/5">Rating Vector</th>
                {PLATFORMS.map(p => (
                  <th key={p.id} className="px-6 py-8 text-center min-w-[140px]">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2">{p.logo}</span>
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">{p.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {categories.map((cat, rowIdx) => (
                <tr key={cat.key} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 sticky left-0 bg-[#11141d] z-10 border-r border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                        {cat.icon}
                      </div>
                      <span className="text-[11px] font-black text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">{cat.label}</span>
                    </div>
                  </td>
                  {PLATFORMS.map(p => {
                    const rating = (p.ratings as any)[cat.key] || 0;
                    return (
                      <td key={`${p.id}-${cat.key}`} className="px-6 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(dot => (
                              <div 
                                key={dot} 
                                className={`w-1.5 h-4 rounded-full transition-all ${dot <= rating ? 'bg-indigo-500' : 'bg-white/5'}`} 
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] font-black ${rating >= 4 ? 'text-indigo-400' : 'text-white/20'}`}>{rating}/5</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              <tr className="bg-indigo-500/[0.03]">
                 <td className="px-8 py-8 sticky left-0 bg-[#11141d] z-10 border-r border-white/5">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Final Verdict</span>
                 </td>
                 {PLATFORMS.map(p => (
                   <td key={`${p.id}-verdict`} className="px-6 py-8 text-center">
                      <p className="text-[10px] font-bold text-white/80 leading-tight italic px-2">"{p.bestFor[0]}"</p>
                      <button className="mt-4 px-3 py-1.5 bg-indigo-500 text-[9px] font-black uppercase text-white rounded-lg hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">Connect</button>
                   </td>
                 ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
         <div className="ph-panel p-8 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20">
            <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-4 flex items-center gap-2">
               <Info size={14} className="text-indigo-400" /> Methodology Disclaimer
            </h4>
            <p className="text-white/40 text-[11px] leading-relaxed">Our ratings are updated every 24 hours. We pull API data from liquidity pools, community sentiment from Discord/Twitter, and real-time fee volatility indices. Regulatory scores are based on current CFTC and international licensure statuses.</p>
         </div>
         <div className="ph-panel p-8 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
            <div>
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-2">Missing a platform?</h4>
              <p className="text-white/40 text-[11px]">Suggest a new exchange for the matrix.</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-all group-hover:border-indigo-400">
               <ChevronRight size={20} className="text-white/20 group-hover:text-white" />
            </div>
         </div>
      </div>
    </div>
  );
};

// Added missing Droplets icon for the matrix
const Droplets = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4Z" />
    <path d="M17 16.3c2.2 0 4-1.8 4-4 0-3.3-4-8-4-8s-4 4.7-4 8c0 2.2 1.8 4 4 4Z" />
  </svg>
);

// Added missing CommunityModal component
const CommunityModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg ph-panel overflow-hidden bg-[#0c0e16] border-indigo-500/20 shadow-3xl p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">Social Index</h2>
            <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors bg-white/5 rounded-full"><X size={20}/></button>
          </div>
          
          <div className="space-y-6">
            <p className="text-white/40 text-sm leading-relaxed">Connect with 120,000+ forecasters. Share your positions and track global sentiment in real-time.</p>
            
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Twitter size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white uppercase tracking-tight">Twitter Feed</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">#PredictHub_Alpha</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>
              
              <button className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <MessageSquare size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-white uppercase tracking-tight">Discord Server</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Join the Alpha</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </button>
            </div>
            
            <div className="p-6 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Invite Friends</h4>
               <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-mono text-white/40 flex items-center overflow-hidden">
                    predict-hub.io/ref/beta_992
                  </div>
                  <button onClick={() => alert("Copied!")} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all flex-shrink-0">
                    <Copy size={16} />
                  </button>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'trending' | 'high_yield' | 'low_yield' | 'new' | 'watchlist'>('all');
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [liveMarkets, setLiveMarkets] = useState<Market[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Terminal State
  const [watchlist, setWatchlist] = useState<string[]>(() => JSON.parse(localStorage.getItem('ph_watchlist') || '[]'));
  const [balance, setBalance] = useState<number>(() => parseFloat(localStorage.getItem('ph_balance') || '10000'));
  const [positions, setPositions] = useState<Position[]>(() => JSON.parse(localStorage.getItem('ph_positions') || '[]'));

  useEffect(() => {
    // Fetch real markets on mount
    const fetchMarkets = async () => {
      try {
        const res = await fetch('/api/markets');
        const data = await res.json();
        if (data.status === 'ok') {
          setLiveMarkets(data.markets);
        }
      } catch (err) {
        console.error("Failed to fetch markets:", err);
      }
    };
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoggedIn(true);
        alert("Successfully connected to Global Network!");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem('ph_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('ph_balance', balance.toString());
    localStorage.setItem('ph_positions', JSON.stringify(positions));
  }, [watchlist, balance, positions]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExecuteTrade = (side: 'Yes' | 'No', amount: number) => {
    if (!selectedMarket) return;
    
    const consensus = selectedMarket.consensus || 50;
    const price = side === 'Yes' ? (consensus / 100) : ((100 - consensus) / 100);
    const shares = Math.floor(amount / price);
    const actualCost = shares * price;

    const newPosition: Position = {
      id: Math.random().toString(36).substr(2, 9),
      marketId: selectedMarket.id,
      marketQuestion: selectedMarket.question,
      side,
      amountSpent: actualCost,
      shares,
      entryPrice: price,
      timestamp: Date.now()
    };

    setBalance(prev => prev - actualCost);
    setPositions(prev => [newPosition, ...prev]);
    setIsDetailModalOpen(false);
    alert(`Successfully bought ${shares} shares of ${side}!`);
  };

  const deletePosition = (id: string) => {
    if (!confirm("Sell position and close trade?")) return;
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    
    // Sell at current consensus
    const market = INITIAL_MARKETS.find(m => m.id === pos.marketId);
    const consensus = market?.consensus || 50;
    const currentPrice = pos.side === 'Yes' ? (consensus / 100) : ((100 - consensus) / 100);
    const payout = pos.shares * currentPrice;

    setBalance(prev => prev + payout);
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const marketData = useMemo(() => {
    const source = liveMarkets.length > 0 ? liveMarkets : INITIAL_MARKETS;
    let base = source.map(m => {
      const vals = Object.values(m.prices).filter((v): v is number => v !== undefined);
      const consensus = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      const arbGap = Math.max(...vals) - Math.min(...vals);
      return { ...m, consensus, arbGap };
    });

    if (search) {
      base = base.filter(m => m.question.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()));
    }

    if (filterType === 'trending') {
      base = base.sort((a,b) => parseFloat(b.volume.replace(/[^0-9.]/g, '')) - parseFloat(a.volume.replace(/[^0-9.]/g, '')));
    } else if (filterType === 'high_yield') {
      base = base.filter(m => (m.arbGap || 0) >= 5).sort((a,b) => (b.arbGap || 0) - (a.arbGap || 0));
    } else if (filterType === 'watchlist') {
      base = base.filter(m => watchlist.includes(m.id));
    } else if (filterType === 'new') {
      base = [...base].reverse(); 
    }

    return base;
  }, [search, filterType, watchlist]);

  useEffect(() => {
    if (activeTab === TabType.HOME && !aiAnalysis && marketData.length > 0) {
      setIsAiLoading(true);
      getGeminiMarketAnalysis(marketData.slice(0, 10))
        .then(setAiAnalysis)
        .finally(() => setIsAiLoading(false));
    }
  }, [activeTab, aiAnalysis, marketData]);

  const parsedAiSections = useMemo(() => {
    if (!aiAnalysis) return [];
    const sections = aiAnalysis.split(/\n(?=\[.*?\])/g).filter(s => s.trim().length > 0);
    return sections.map(s => {
      const titleMatch = s.match(/^\s*\[(.*?)\]/);
      const title = titleMatch ? titleMatch[1] : "Strategic Update";
      const content = s.replace(/^\s*\[(.*?)\]/, "").replace(/\*/g, "").trim();
      return { title, content };
    });
  }, [aiAnalysis]);

  return (
    <div className="min-h-screen bg-[#06080f] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      <nav className="h-16 border-b border-white/5 bg-[#06080f]/90 backdrop-blur-xl sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => setActiveTab(TabType.HOME)}>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-black text-base md:text-xl tracking-tighter uppercase italic">
              Predict<span className="ph-gradient-text">Hub</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-1">
            {[TabType.HOME, TabType.PLATFORMS, TabType.ODDS, TabType.COMPARE, TabType.ACCURACY].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-400 bg-indigo-400/5' : 'text-white/40 hover:text-white'}`}>
                {tab === TabType.COMPARE ? 'Compare Matrix' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <div className="flex items-center gap-2">
                <Wallet size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-white">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
          </div>
          {isLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600/20 rounded-full border border-indigo-500/30">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-indigo-400 uppercase">Live Node</span>
            </div>
          ) : (
            <button onClick={handleLogin} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all">
               <Lock size={12} className="text-white/40" />
               <span className="text-[9px] font-black text-white/60 uppercase">Connect Account</span>
            </button>
          )}
          <button onClick={() => setIsCommunityModalOpen(true)} className="p-2.5 rounded-full text-white/40 hover:text-indigo-400 hover:bg-white/5 transition-all">
            <Share2 size={18}/>
          </button>
          <button className="lg:hidden p-2 text-white/40" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[150] bg-[#06080f] p-8 lg:hidden flex flex-col gap-6">
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-xl tracking-tighter uppercase italic">Terminal</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/40"><X size={24}/></button>
            </div>
            {[TabType.HOME, TabType.PLATFORMS, TabType.ODDS, TabType.COMPARE, TabType.ACCURACY].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className={`text-2xl font-black uppercase italic text-left tracking-tighter ${activeTab === tab ? 'text-indigo-400' : 'text-white/40'}`}>
                {tab === TabType.COMPARE ? 'Compare Matrix' : tab}
              </button>
            ))}
            <div className="mt-auto space-y-4">
               <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Simulation Balance</span>
                  <span className="text-2xl font-black text-white">${balance.toLocaleString()}</span>
               </div>
               <button onClick={() => { setIsCommunityModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Community Index</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === TabType.HOME && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 md:space-y-16">
              <HeroSearch onSearch={setSearch} />
              
              <div className="grid grid-cols-12 gap-6 md:gap-8">
                 <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
                        {[
                          { id: 'all', label: 'All', icon: <Globe size={10}/> },
                          { id: 'trending', label: 'Trending', icon: <TrendingUp size={10}/> },
                          { id: 'high_yield', label: 'High Yield', icon: <Zap size={10}/> },
                          { id: 'watchlist', label: 'Watchlist', icon: <Star size={10}/> },
                          { id: 'new', label: 'New', icon: <Clock size={10}/> }
                        ].map(f => (
                          <button key={f.id} onClick={() => setFilterType(f.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterType === f.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}>
                            {f.icon}{f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <LiveOddsFeed markets={marketData.slice(0, 10)} onMarketClick={(m) => { setSelectedMarket(m); setIsDetailModalOpen(true); }} watchlist={watchlist} onWatch={toggleWatchlist} />
                    
                    <div className="space-y-6">
                       <h3 className="text-lg md:text-xl font-black uppercase italic text-white flex items-center gap-3">
                         Terminal Intelligence <Sparkles size={18} className={`text-indigo-400 ${isAiLoading ? 'animate-spin' : 'animate-pulse'}`} />
                       </h3>
                      {isAiLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1,2].map(i => (
                            <div key={i} className="ph-panel p-6 bg-white/[0.02] border-white/5 animate-pulse space-y-4">
                               <div className="h-4 bg-white/5 rounded w-1/3" />
                               <div className="space-y-2"><div className="h-3 bg-white/5 rounded w-full" /><div className="h-3 bg-white/5 rounded w-5/6" /></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedAiSections.map((section, idx) => (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className={`ph-panel p-6 bg-gradient-to-br border-white/5 ${idx === 0 ? 'from-indigo-600/10 to-transparent border-indigo-500/20' : 'from-white/[0.02] to-transparent'}`}>
                               <div className="flex items-center gap-2 mb-3">
                                  {idx === 0 ? <Target size={14} className="text-indigo-400" /> : idx === 1 ? <Zap size={14} className="text-indigo-400" /> : <Shield size={14} className="text-indigo-400" />}
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">{section.title}</h4>
                               </div>
                               <div className="text-white/60 text-[11px] md:text-xs leading-relaxed whitespace-pre-line">{section.content}</div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                 </div>
                 
                 <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
                    <PortfolioSection balance={balance} positions={positions} onDeletePosition={deletePosition} />
                    
                    <div className="ph-panel p-6 md:p-8">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2"><Activity size={12}/> Global Liquidity</h4>
                       <div className="space-y-3">
                          {PLATFORMS.slice(0,4).map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl border border-transparent hover:border-white/10 group transition-all">
                               <div className="flex items-center gap-3">
                                  <span className="text-xl">{p.logo}</span>
                                  <span className="text-[11px] font-bold text-white/60 group-hover:text-white">{p.name}</span>
                               </div>
                               <div className="text-right">
                                  <span className="text-[9px] font-black text-indigo-400 uppercase block">{p.volume}</span>
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">F5 Score: {p.accuracy}%</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === TabType.PLATFORMS && (
            <motion.div key="platforms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="max-w-2xl"><h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Gateways</h1></div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{PLATFORMS.map(p => <PlatformCard key={p.id} platform={p} />)}</div>
            </motion.div>
          )}

          {activeTab === TabType.ODDS && (
            <motion.div key="odds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="max-w-xl"><h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Master Index</h1></div>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['all', 'trending', 'high_yield', 'watchlist', 'new'].map(f => (
                      <button key={f} onClick={() => setFilterType(f as any)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === f ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}>{f.replace('_', ' ')}</button>
                    ))}
                  </div>
               </div>
               <LiveOddsFeed markets={marketData} onMarketClick={(m) => { setSelectedMarket(m); setIsDetailModalOpen(true); }} watchlist={watchlist} onWatch={toggleWatchlist} />
            </motion.div>
          )}

          {activeTab === TabType.ACCURACY && (
            <motion.div key="accuracy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><AccuracyLeaderboard /></motion.div>
          )}

          {activeTab === TabType.COMPARE && (
            <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PlatformComparisonMatrix /></motion.div>
          )}
        </AnimatePresence>
      </main>

      <MarketDetailModal 
        market={selectedMarket} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        onWatch={toggleWatchlist} 
        isWatched={selectedMarket ? watchlist.includes(selectedMarket.id) : false} 
        balance={balance}
        onTrade={handleExecuteTrade}
      />
      
      <CommunityModal isOpen={isCommunityModalOpen} onClose={() => setIsCommunityModalOpen(false)} />

      <footer className="h-10 bg-[#06080f] border-t border-white/5 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
           {[1,2,3,4].map(i => (
             <div key={i} className="inline-flex items-center gap-16 px-16">
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">BTC/USD: <span className="text-white">$102,492</span></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">FED/CUT: <span className="text-white">64.2%</span></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">ETH/GAS: <span className="text-white">12 GWEI</span></span>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}

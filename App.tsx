
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, TrendingUp, Activity, BarChart3, 
  Zap, History, Sparkles, CheckCircle2,
  X, ExternalLink, Filter, Globe, Shield, Link2, Code, BrainCircuit, Menu, ChevronRight, Send, Star, ArrowRight, Lock, Target, TrendingDown, MessageSquare, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, Market, Platform } from './types';
import { PLATFORMS, INITIAL_MARKETS, NEWS_FEED } from './constants';
import { getGeminiMarketAnalysis } from './services/gemini';

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

const PlatformCard: React.FC<{ platform: Platform }> = ({ platform }) => (
  <div className="ph-panel p-5 md:p-6 flex flex-col group hover:border-indigo-500/30 transition-all bg-gradient-to-br from-white/[0.03] to-transparent">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-3xl md:text-4xl">{platform.logo}</span>
        <div>
          <h3 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic text-sm md:text-base">{platform.name}</h3>
          <span className="text-[8px] md:text-[9px] font-black uppercase text-white/20 tracking-widest">{platform.type}</span>
        </div>
      </div>
      <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${platform.usFriendly ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
        {platform.usFriendly ? 'US OK' : 'No US'}
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <p className="text-[8px] font-black text-white/20 uppercase mb-1">Accuracy Grade</p>
        <p className="text-base md:text-lg font-black text-indigo-400">{platform.accuracy > 90 ? 'A' : 'B'}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
        <p className="text-[8px] font-black text-white/20 uppercase mb-1">Best For</p>
        <p className="text-[9px] md:text-[10px] font-bold text-white/60 truncate">{platform.bestFor[0]}</p>
      </div>
    </div>

    <div className="space-y-2 mt-auto">
      <div className="flex justify-between items-center text-[9px] md:text-[10px]">
        <span className="text-white/20 font-black uppercase">Liquidity</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 md:w-2 h-1 rounded-full ${i <= platform.ratings.liquidity ? 'bg-indigo-500' : 'bg-white/10'}`} />)}
        </div>
      </div>
    </div>

    <button className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all active:scale-[0.98]">
      View Intelligence
    </button>
  </div>
);

const LiveOddsFeed = ({ markets }: { markets: Market[] }) => (
  <div className="ph-panel overflow-hidden border-white/5 bg-black/10 shadow-2xl">
    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
      <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 flex items-center gap-2">
         <Shield size={12} className="text-indigo-500"/> Price Comparison Matrix
      </h2>
      <div className="flex gap-4">
         <Filter size={14} className="text-white/20 cursor-pointer hover:text-white transition-colors" />
      </div>
    </div>
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Market Name</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Platforms</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Consensus</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Savings Gap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {markets.map(m => {
            return (
              <tr key={m.id} className="hover:bg-indigo-500/[0.03] cursor-pointer transition-all group">
                <td className="px-4 md:px-6 py-4">
                  <p className="text-[12px] md:text-[14px] font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{m.question}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[8px] font-black uppercase text-indigo-400/60 tracking-widest">{m.category}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase flex items-center gap-1"><History size={10}/> {m.ends}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                   <div className="flex justify-center gap-1.5">
                      {Object.entries(m.prices).map(([p, v]) => (
                        <div key={p} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center transition-all hover:bg-white/10" title={`${p}: ${v}%`}>
                          <span className="text-[8px] font-black text-white/40 uppercase leading-none">{p[0]}</span>
                          <span className="text-[10px] font-bold text-white mt-0.5">{v}%</span>
                        </div>
                      ))}
                   </div>
                </td>
                <td className="px-4 md:px-6 py-4 text-center">
                  <span className="text-xs md:text-sm font-black text-white/80">{m.consensus}%</span>
                </td>
                <td className="px-4 md:px-6 py-4 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border transition-all ${m.arbGap! >= 4 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-white/5 text-white/30 border-white/5'}`}>
                     {m.arbGap}%
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const SuggestModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg ph-panel p-6 md:p-8 bg-gradient-to-br from-[#11141d] to-[#06080f] overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4">
             <button onClick={onClose} className="text-white/20 hover:text-white transition-colors p-2">
                <X size={20}/>
             </button>
          </div>
          <div className="flex flex-col items-center text-center">
             <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <MessageSquare className="text-indigo-400" size={28}/>
             </div>
             <h3 className="text-xl md:text-2xl font-black uppercase italic text-white mb-2">Build the Future With Us</h3>
             <p className="text-white/40 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                What events or niche markets would you love to see indexed on PredictHub? Your suggestions directly influence our data roadmap.
             </p>
             <div className="w-full space-y-4">
                <input 
                  type="text" 
                  placeholder="e.g. Local election results..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 md:py-4 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none transition-all text-sm"
                />
                <button 
                  onClick={() => {
                    alert("Thank you! Suggestion received.");
                    onClose();
                  }}
                  className="w-full py-3.5 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Submit Suggestion
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Accuracy Leaderboard Component fix ---
const AccuracyLeaderboard = () => (
  <div className="ph-panel overflow-hidden border-white/5 bg-black/10 shadow-2xl">
    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
      <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 flex items-center gap-2">
         <Target size={12} className="text-indigo-500"/> F5 Forecasting Accuracy Leaderboard
      </h2>
    </div>
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Rank</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Platform</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Accuracy Grade</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-center">Brier Score</th>
            <th className="px-4 md:px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {[...PLATFORMS].sort((a, b) => b.accuracy - a.accuracy).map((p, idx) => (
            <tr key={p.id} className="hover:bg-indigo-500/[0.03] transition-all group">
              <td className="px-4 md:px-6 py-4 text-center">
                <span className="text-[10px] font-black text-white/20">#{idx + 1}</span>
              </td>
              <td className="px-4 md:px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.logo}</span>
                  <div>
                    <span className="text-sm font-black text-white uppercase italic block">{p.name}</span>
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{p.type}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-center">
                <span className={`text-sm font-black ${p.accuracy > 90 ? 'text-indigo-400' : 'text-white/40'}`}>{p.accuracy}%</span>
              </td>
              <td className="px-4 md:px-6 py-4 text-center">
                <span className="text-xs font-bold text-white/60">{p.brierScore}</span>
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${p.accuracy > 90 ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'bg-white/5 text-white/30 border-white/5'}`}>
                   {p.accuracy > 90 ? 'Elite' : 'Reliable'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'trending' | 'high_yield' | 'low_yield' | 'new'>('all');
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const marketData = useMemo(() => {
    let filtered = INITIAL_MARKETS.map(m => {
      const vals = Object.values(m.prices).filter((v): v is number => v !== undefined);
      const consensus = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      const arbGap = Math.max(...vals) - Math.min(...vals);
      return { ...m, consensus, arbGap };
    });

    // Search
    if (search) {
      filtered = filtered.filter(m => 
        m.question.toLowerCase().includes(search.toLowerCase()) || 
        m.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter type
    if (filterType === 'trending') {
      filtered = filtered.sort((a,b) => parseFloat(b.volume.replace(/[^0-9.]/g, '')) - parseFloat(a.volume.replace(/[^0-9.]/g, '')));
    } else if (filterType === 'high_yield') {
      filtered = filtered.filter(m => (m.arbGap || 0) >= 5).sort((a,b) => (b.arbGap || 0) - (a.arbGap || 0));
    } else if (filterType === 'low_yield') {
      filtered = filtered.filter(m => (m.arbGap || 0) < 2).sort((a,b) => (a.arbGap || 0) - (b.arbGap || 0));
    } else if (filterType === 'new') {
      filtered = [...filtered].reverse(); // Assuming newest at end of constant
    }

    return filtered;
  }, [search, filterType]);

  // Fetch AI Analysis
  useEffect(() => {
    if (activeTab === TabType.HOME && !aiAnalysis && marketData.length > 0) {
      setIsAiLoading(true);
      getGeminiMarketAnalysis(marketData.slice(0, 10))
        .then(setAiAnalysis)
        .catch(err => console.error("AI Analysis Error:", err))
        .finally(() => setIsAiLoading(false));
    }
  }, [activeTab, aiAnalysis, marketData]);

  // Helper to split AI response into readable sections (now cleaning asterisks)
  const parsedAiSections = useMemo(() => {
    if (!aiAnalysis) return [];
    // Split by our custom [HEADER] format
    const sections = aiAnalysis.split(/\n(?=\[.*?\])/g).filter(s => s.trim().length > 0);
    return sections.map(s => {
      const titleMatch = s.match(/^\s*\[(.*?)\]/);
      const title = titleMatch ? titleMatch[1] : "Strategic Update";
      // Remove the header from content and clear any stray asterisks just in case
      const content = s.replace(/^\s*\[(.*?)\]/, "").replace(/\*/g, "").trim();
      return { title, content };
    });
  }, [aiAnalysis]);

  return (
    <div className="min-h-screen bg-[#06080f] text-[#e2e8f0] flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Universal Nav */}
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
            {[TabType.HOME, TabType.PLATFORMS, TabType.ODDS, TabType.ACCURACY].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-400 bg-indigo-400/5' : 'text-white/40 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsSuggestModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-lg active:scale-95"
          >
            <MessageSquare size={12}/>
            Suggest
          </button>
          
          {/* Mobile Menu Trigger */}
          <button className="lg:hidden p-2 text-white/40 active:bg-white/5 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-[150] bg-[#06080f] p-8 lg:hidden flex flex-col gap-6"
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-xl tracking-tighter uppercase italic">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/40"><X size={24}/></button>
            </div>
            {[TabType.HOME, TabType.PLATFORMS, TabType.ODDS, TabType.ACCURACY].map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                className={`text-2xl font-black uppercase italic text-left tracking-tighter ${activeTab === tab ? 'text-indigo-400' : 'text-white/40'}`}
              >
                {tab}
              </button>
            ))}
            <div className="mt-auto">
               <button 
                onClick={() => { setIsSuggestModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs"
              >
                Suggest a Market
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 md:p-8 space-y-8 md:space-y-12">
        
        <AnimatePresence mode="wait">
          {activeTab === TabType.HOME && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 md:space-y-16">
              <HeroSearch onSearch={setSearch} />
              
              <div className="grid grid-cols-12 gap-6 md:gap-8">
                 <div className="col-span-12 lg:col-span-8 space-y-8 md:space-y-12">
                    
                    {/* Filter Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                       {[
                         { id: 'all', label: 'All', icon: <Globe size={10}/> },
                         { id: 'trending', label: 'Trending', icon: <TrendingUp size={10}/> },
                         { id: 'high_yield', label: 'High Yield', icon: <Zap size={10}/> },
                         { id: 'low_yield', label: 'Stable', icon: <Shield size={10}/> },
                         { id: 'new', label: 'New', icon: <Clock size={10}/> }
                       ].map(f => (
                         <button 
                           key={f.id}
                           onClick={() => setFilterType(f.id as any)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterType === f.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                         >
                           {f.icon}
                           {f.label}
                         </button>
                       ))}
                    </div>

                    <LiveOddsFeed markets={marketData.slice(0, 10)} />
                    
                    {/* Daily Intelligence Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-3">
                           <h3 className="text-lg md:text-xl font-black uppercase italic text-white flex items-center gap-3">
                             Daily Market Insights <Sparkles size={18} className={`text-indigo-400 ${isAiLoading ? 'animate-spin' : 'animate-pulse'}`} />
                           </h3>
                         </div>
                         <p className="text-[10px] md:text-[11px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                            Our AI scans for the best price differences across 10+ platforms.
                         </p>
                      </div>

                      {isAiLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1,2].map(i => (
                            <div key={i} className="ph-panel p-6 bg-white/[0.02] border-white/5 animate-pulse space-y-4">
                               <div className="h-4 bg-white/5 rounded w-1/3" />
                               <div className="space-y-2">
                                 <div className="h-3 bg-white/5 rounded w-full" />
                                 <div className="h-3 bg-white/5 rounded w-5/6" />
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {parsedAiSections.length > 0 ? parsedAiSections.map((section, idx) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx} 
                              className={`ph-panel p-6 bg-gradient-to-br border-white/5 ${idx === 0 ? 'from-indigo-600/10 to-transparent border-indigo-500/20' : 'from-white/[0.02] to-transparent'}`}
                            >
                               <div className="flex items-center gap-2 mb-3">
                                  {idx === 0 ? <Target size={14} className="text-indigo-400" /> : idx === 1 ? <Zap size={14} className="text-indigo-400" /> : <Shield size={14} className="text-indigo-400" />}
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">{section.title}</h4>
                               </div>
                               <div className="text-white/60 text-[11px] md:text-xs leading-relaxed whitespace-pre-line">
                                  {section.content}
                               </div>
                            </motion.div>
                          )) : (
                            <div className="col-span-full ph-panel p-8 text-center text-white/20 italic text-sm">
                               Scanning for deals...
                            </div>
                          )}
                        </div>
                      )}

                      <button onClick={() => setActiveTab(TabType.ODDS)} className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 group ml-2 active:translate-x-1 transition-all">
                         View All 20+ Predictions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                    </div>
                 </div>
                 
                 <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
                    <div className="ph-panel p-6 md:p-8">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2"><Activity size={12}/> Best Apps</h4>
                       <div className="space-y-3 md:space-y-4">
                          {[
                            { label: "Best for US Residents", id: "kalshi" },
                            { label: "Highest Liquidity", id: "polymarket" },
                            { label: "Casual & Social", id: "manifold" },
                            { label: "Best Sports Odds", id: "smarkets" }
                          ].map(u => (
                            <div key={u.id} className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10 group active:scale-[0.98]">
                               <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors">{u.label}</span>
                               <ChevronRight size={14} className="text-white/20" />
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="ph-panel p-6 md:p-8 border-indigo-500/10 hidden sm:block">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2"><Zap size={12}/> Live Updates</h4>
                       <div className="space-y-6">
                          {NEWS_FEED.map(n => (
                            <div key={n.id} className="border-l border-white/10 pl-4 py-1">
                               <p className="text-[12px] font-bold text-white mb-1 leading-tight">{n.title}</p>
                               <span className="text-[9px] font-black text-white/20 uppercase">{n.time} • {n.tag}</span>
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
               <div className="max-w-2xl px-2 sm:px-0">
                 <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Platform Hub</h1>
                 <p className="text-white/40 text-sm md:text-base leading-relaxed">The ultimate guide to every major prediction site. We rank them so you know where to trade safely.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PLATFORMS.map(p => <PlatformCard key={p.id} platform={p} />)}
               </div>
            </motion.div>
          )}

          {activeTab === TabType.ODDS && (
            <motion.div key="odds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 sm:px-0">
                  <div className="max-w-xl">
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white mb-4">Full Market Index</h1>
                    <p className="text-white/40 text-sm md:text-base leading-relaxed">Real-time price comparisons across the most popular events on earth.</p>
                  </div>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['all', 'trending', 'high_yield', 'new'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilterType(f as any)}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex-1 md:flex-none whitespace-nowrap ${filterType === f ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
               </div>
               <LiveOddsFeed markets={marketData} />
            </motion.div>
          )}

          {activeTab === TabType.ACCURACY && (
            <motion.div key="accuracy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <AccuracyLeaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SuggestModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />

      {/* Footer Ticker */}
      <footer className="h-10 bg-[#06080f] border-t border-white/5 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className="inline-flex items-center gap-16 px-16">
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">BTC/USD: <span className="text-white">$102,492</span></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">FED/CUT: <span className="text-white">64.2%</span></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">GPT-5: <span className="text-white">72.1%</span></span>
               <span className="text-[10px] font-black uppercase tracking-tighter text-white/20 italic">SPX/500: <span className="text-white">6104</span></span>
             </div>
           ))}
        </div>
      </footer>
    </div>
  );
}


import { Platform, Market, NewsItem } from './types';

export const PLATFORMS: Platform[] = [
  { 
    id: "polymarket", name: "Polymarket", logo: "🔷", type: 'decentralized', isRealMoney: true, usFriendly: false,
    accuracy: 94.2, brierScore: 0.12, volume: "$3.1B", feeStructure: "Zero (Network only)",
    categories: ["Politics", "Crypto", "Global"],
    ratings: { liquidity: 5, variety: 5, fees: 5, ux: 4, regulatory: 2, beginner: 3 },
    pros: ["Highest liquidity", "Zero trading fees", "Crypto native"],
    cons: ["VPN usually required for US", "Requires USDC/Polygon"],
    bestFor: ["Politics", "Arbitrage", "High Volume"]
  },
  { 
    id: "kalshi", name: "Kalshi", logo: "🟢", type: 'centralized', isRealMoney: true, usFriendly: true,
    accuracy: 91.8, brierScore: 0.14, volume: "$2.4B", feeStructure: "Low (Subscription/Tiered)",
    categories: ["Economics", "Weather", "US Politics"],
    ratings: { liquidity: 4, variety: 3, fees: 4, ux: 5, regulatory: 5, beginner: 5 },
    pros: ["CFTC Regulated", "Bank deposits", "50-state legal"],
    cons: ["Limited categories", "Lower liquidity than Poly"],
    bestFor: ["Regulated Trading", "US Residents", "Macro Economics"]
  },
  { 
    id: "predictit", name: "PredictIt", logo: "🔴", type: 'centralized', isRealMoney: true, usFriendly: true,
    accuracy: 88.5, brierScore: 0.18, volume: "$410M", feeStructure: "10% on profit",
    categories: ["Politics", "Elections"],
    ratings: { liquidity: 2, variety: 2, fees: 1, ux: 3, regulatory: 4, beginner: 4 },
    pros: ["US Legal (No-Action)", "Unique political depth"],
    cons: ["High fees", "850-share limit", "Slow settlement"],
    bestFor: ["Small scale politics", "Academic data"]
  },
  { 
    id: "manifold", name: "Manifold", logo: "🟣", type: 'forecasting', isRealMoney: false, usFriendly: true,
    accuracy: 84.1, brierScore: 0.22, volume: "N/A", feeStructure: "Play money",
    categories: ["Niche", "Personal", "Sci-Fi"],
    ratings: { liquidity: 1, variety: 5, fees: 5, ux: 5, regulatory: 3, beginner: 5 },
    pros: ["Most creative markets", "Infinite variety", "Fun UX"],
    cons: ["No cash payout", "Market manipulation risk"],
    bestFor: ["Casual forecasting", "Niche topics"]
  },
  { 
    id: "smarkets", name: "Smarkets", logo: "🟡", type: 'centralized', isRealMoney: true, usFriendly: false,
    accuracy: 92.5, brierScore: 0.13, volume: "$1.2B", feeStructure: "2% commission",
    categories: ["Sports", "Politics"],
    ratings: { liquidity: 4, variety: 4, fees: 3, ux: 4, regulatory: 4, beginner: 3 },
    pros: ["Best for Sports", "Competitive odds"],
    cons: ["UK/EU centered", "Tough KYC"],
    bestFor: ["European Markets", "Sports Arbitrage"]
  },
  { 
    id: "insight", name: "Insight Prediction", logo: "👁️", type: 'centralized', isRealMoney: true, usFriendly: true,
    accuracy: 89.0, brierScore: 0.16, volume: "$50M", feeStructure: "Moderate",
    categories: ["Hedge", "Finance"],
    ratings: { liquidity: 2, variety: 3, fees: 3, ux: 2, regulatory: 3, beginner: 2 },
    pros: ["US friendly", "Aggressive pricing"],
    cons: ["Low volume", "Old UX"],
    bestFor: ["Hedging", "Contrarian bets"]
  }
];

export const INITIAL_MARKETS: Market[] = [
  { id: "m1", question: "Fed Interest Rate cut in March 2026?", category: "Economics", prices: { polymarket: 64, kalshi: 61, predictit: 68 }, volume: "$14.2M", ends: "Mar 2026", isMatched: true },
  { id: "m2", question: "OpenAI launches GPT-5 before July 2026?", category: "Tech", prices: { polymarket: 72, kalshi: 68, manifold: 75 }, volume: "$2.8M", ends: "Jun 2026", isMatched: true },
  { id: "m3", question: "SpaceX Starship reaches orbit on next test flight?", category: "Science", prices: { polymarket: 79, kalshi: 77, predictit: 75 }, volume: "$1.1M", ends: "Apr 2026", isMatched: true },
  { id: "m4", question: "Winner of 2026 French Presidential Election?", category: "Politics", prices: { polymarket: 42, predictit: 45, manifold: 40 }, volume: "$8.4M", ends: "May 2026", isMatched: true },
  { id: "m5", question: "Bitcoin price exceeds $150,000 by Dec 2026?", category: "Crypto", prices: { polymarket: 55, kalshi: 52, manifold: 58 }, volume: "$22.1M", ends: "Dec 2026", isMatched: true },
  { id: "m6", question: "Will the US enter a recession in 2026?", category: "Economics", prices: { polymarket: 31, kalshi: 34, predictit: 42 }, volume: "$12.8M", ends: "Dec 2026", isMatched: true },
  { id: "m7", question: "Apple announces Vision Pro 2 in 2026?", category: "Tech", prices: { polymarket: 45, manifold: 48 }, volume: "$900k", ends: "Oct 2026" },
  { id: "m8", question: "Who will win the 2026 World Cup?", category: "Sports", prices: { smarkets: 14, betfair: 15, manifold: 12 }, volume: "$45.0M", ends: "Jul 2026" },
  { id: "m9", question: "Kamala Harris approval rating above 45% in 2026?", category: "Politics", prices: { predictit: 38, kalshi: 35 }, volume: "$2.1M", ends: "Dec 2026" },
  { id: "m10", question: "Meta releases fully AR glasses in 2026?", category: "Tech", prices: { polymarket: 22, manifold: 28 }, volume: "$4.5M", ends: "Nov 2026" },
  { id: "m11", question: "Oil price per barrel below $60 by Aug 2026?", category: "Economics", prices: { kalshi: 18, polymarket: 15 }, volume: "$6.2M", ends: "Aug 2026" },
  { id: "m12", question: "TikTok remains legal in the US by July 2026?", category: "Legal", prices: { polymarket: 48, kalshi: 52, predictit: 50 }, volume: "$9.2M", ends: "Jul 2026", isMatched: true },
  { id: "m13", question: "Ethereum ETF volume exceeds Bitcoin ETF in 2026?", category: "Crypto", prices: { polymarket: 25, manifold: 30 }, volume: "$1.4M", ends: "Dec 2026" },
  { id: "m14", question: "NASA finds evidence of past life on Mars in 2026?", category: "Science", prices: { manifold: 12, polymarket: 8 }, volume: "$500k", ends: "Dec 2026" },
  { id: "m15", question: "UK rejoins the Single Market by 2030?", category: "Politics", prices: { smarkets: 28, manifold: 32 }, volume: "$3.8M", ends: "Dec 2029" },
  { id: "m16", question: "Global average temp rise exceeds 1.5C in 2026?", category: "Science", prices: { kalshi: 88, polymarket: 85, manifold: 90 }, volume: "$2.2M", ends: "Dec 2026" },
  { id: "m17", question: "Tesla Robotaxi operating in 3+ cities in 2026?", category: "Tech", prices: { polymarket: 15, manifold: 22, kalshi: 12 }, volume: "$11.5M", ends: "Dec 2026" },
  { id: "m18", question: "Universal Basic Income trial in a major US city?", category: "Politics", prices: { manifold: 45, predictit: 40 }, volume: "$1.1M", ends: "Dec 2026" },
  { id: "m19", question: "New COVID-26 variant leads to lockdowns?", category: "Health", prices: { polymarket: 5, manifold: 8 }, volume: "$4.1M", ends: "Dec 2026" },
  { id: "m20", question: "Nuclear Fusion net energy gain in a commercial reactor?", category: "Science", prices: { manifold: 15, polymarket: 10 }, volume: "$1.8M", ends: "Dec 2026" }
];

export const NEWS_FEED: NewsItem[] = [
  { id: 1, tag: "REGULATION", title: "CFTC issues new guidance on Event Contracts", time: "2h ago" },
  { id: 2, tag: "PLATFORM", title: "Polymarket integrates Solana for faster settlement", time: "5h ago" },
  { id: 3, tag: "MARKET", title: "Arbitrage opportunity: GPT-5 odds diverge by 7%", time: "8h ago" },
];

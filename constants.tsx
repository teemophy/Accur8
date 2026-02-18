import { Platform, Market, NewsItem } from './types';

export const PLATFORMS: Platform[] = [
  { id: "polymarket", name: "Polymarket", logo: "🔷", color: "#0092FF", status: "Operational", accuracy: 94.2, volume: "$3.1B", delay: "240ms" },
  { id: "kalshi", name: "Kalshi", logo: "🟢", color: "#00B37E", status: "Operational", accuracy: 91.8, volume: "$2.4B", delay: "110ms" },
  { id: "predictit", name: "PredictIt", logo: "🔴", color: "#E03B4B", status: "Degraded", accuracy: 88.5, volume: "$410M", delay: "890ms" },
  { id: "manifold", name: "Manifold", logo: "🟣", color: "#7C3AED", status: "Operational", accuracy: 84.1, volume: "N/A", delay: "150ms" },
];

export const INITIAL_MARKETS: Market[] = [
  { id: "m1", question: "Fed Interest Rate cut in March 2026?", category: "Economics", prices: { polymarket: 64, kalshi: 61, predictit: 68 }, volume: "$4.2M", ends: "Mar 2026" },
  { id: "m2", question: "OpenAI launches GPT-5 before July 2026?", category: "Tech", prices: { polymarket: 72, kalshi: 68, manifold: 75 }, volume: "$2.8M", ends: "Jun 2026" },
  { id: "m3", question: "SpaceX Starship reaches orbit on next test flight?", category: "Science", prices: { polymarket: 79, kalshi: 77, predictit: 75 }, volume: "$1.1M", ends: "Apr 2026" },
  { id: "m4", question: "Winner of 2026 French Presidential Election?", category: "Politics", prices: { polymarket: 42, predictit: 45 }, volume: "$8.4M", ends: "May 2026" },
  { id: "m5", question: "Bitcoin price exceeds $150,000 by Dec 2026?", category: "Crypto", prices: { polymarket: 55, kalshi: 52, manifold: 58 }, volume: "$22.1M", ends: "Dec 2026" },
  { id: "m6", question: "Will the US enter a recession in 2026?", category: "Economics", prices: { polymarket: 31, kalshi: 34, predictit: 38 }, volume: "$12.8M", ends: "Dec 2026" },
  { id: "m7", question: "Apple announces Vision Pro 2 in 2026?", category: "Tech", prices: { polymarket: 45, kalshi: 40, manifold: 48 }, volume: "$900k", ends: "Oct 2026" },
  { id: "m8", question: "Super Bowl LX winner: Chiefs or 49ers?", category: "Sports", prices: { polymarket: 52, kalshi: 50, predictit: 53 }, volume: "$5.5M", ends: "Feb 2026" },
  { id: "m9", question: "Ukraine-Russia ceasefire by Dec 2026?", category: "Global", prices: { polymarket: 22, predictit: 28, manifold: 25 }, volume: "$15.4M", ends: "Dec 2026" },
  { id: "m10", question: "Taylor Swift announces engagement in 2026?", category: "Culture", prices: { polymarket: 68, manifold: 72 }, volume: "$2.1M", ends: "Dec 2026" },
  { id: "m11", question: "Neuralink successfully implants 100th patient?", category: "Science", prices: { polymarket: 85, manifold: 82 }, volume: "$1.4M", ends: "Dec 2026" },
  { id: "m12", question: "TikTok remains legal in the US by July 2026?", category: "Legal", prices: { polymarket: 48, kalshi: 52, predictit: 50 }, volume: "$9.2M", ends: "Jul 2026" },
  { id: "m13", question: "Solana market cap exceeds Ethereum in 2026?", category: "Crypto", prices: { polymarket: 15, kalshi: 12, manifold: 18 }, volume: "$31M", ends: "Dec 2026" },
  { id: "m14", question: "AI wins an Academy Award for Screenplay?", category: "Culture", prices: { polymarket: 8, manifold: 12 }, volume: "$450k", ends: "Mar 2026" },
  { id: "m15", question: "Tesla delivers more than 2.5M cars in 2026?", category: "Business", prices: { polymarket: 61, kalshi: 58, manifold: 65 }, volume: "$3.3M", ends: "Dec 2026" },
  { id: "m16", question: "Global average temp reaches new record in 2026?", category: "Climate", prices: { polymarket: 88, kalshi: 85 }, volume: "$6.1M", ends: "Dec 2026" },
  { id: "m17", question: "Next UK Prime Minister: Labour or Conservative?", category: "Politics", prices: { polymarket: 75, predictit: 78 }, volume: "$4.4M", ends: "Varies" },
  { id: "m18", question: "Humanoid robots exceed 100k unit sales in 2026?", category: "Tech", prices: { polymarket: 32, manifold: 38 }, volume: "$1.8M", ends: "Dec 2026" },
  { id: "m19", question: "SEC loses Ripple appeal in US Supreme Court?", category: "Legal", prices: { polymarket: 58, manifold: 55 }, volume: "$7.2M", ends: "Dec 2026" },
  { id: "m20", question: "World Cup 2026: USA reaches Quarter Finals?", category: "Sports", prices: { polymarket: 28, kalshi: 25, manifold: 30 }, volume: "$11.2M", ends: "Jul 2026" }
];

export const NEWS_FEED: NewsItem[] = [
  { id: 1, tag: "REGULATION", title: "CFTC issues new guidance on Event Contracts", time: "2h ago" },
  { id: 2, tag: "PLATFORM", title: "Polymarket integrates Solana for faster settlement", time: "5h ago" },
  { id: 3, tag: "MARKET", title: "Arbitrage opportunity: GPT-5 odds diverge by 7%", time: "8h ago" },
];
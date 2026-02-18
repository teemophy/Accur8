
import { Platform, Market, NewsItem } from './types';

export const PLATFORMS: Platform[] = [
  { id: "polymarket", name: "Polymarket", logo: "🔷", color: "#0092FF", status: "Operational", accuracy: 94.2, volume: "$3.1B", delay: "240ms" },
  { id: "kalshi", name: "Kalshi", logo: "🟢", color: "#00B37E", status: "Operational", accuracy: 91.8, volume: "$2.4B", delay: "110ms" },
  { id: "predictit", name: "PredictIt", logo: "🔴", color: "#E03B4B", status: "Degraded", accuracy: 88.5, volume: "$410M", delay: "890ms" },
  { id: "manifold", name: "Manifold", logo: "🟣", color: "#7C3AED", status: "Operational", accuracy: 84.1, volume: "N/A", delay: "150ms" },
];

export const INITIAL_MARKETS: Market[] = [
  {
    id: "m1",
    question: "Federal Reserve interest rate cut in March 2026?",
    category: "Economics",
    prices: { polymarket: 64, kalshi: 61, predictit: 68 },
    volume: "$4.2M",
    ends: "Mar 20, 2026",
  },
  {
    id: "m2",
    question: "Will SpaceX Starship reach orbit on next flight?",
    category: "Science",
    prices: { polymarket: 79, kalshi: 77, manifold: 82, predictit: 75 },
    volume: "$1.1M",
    ends: "Apr 15, 2026",
  },
  {
    id: "m3",
    question: "Will the US enter a recession in 2026?",
    category: "Economics",
    prices: { polymarket: 31, kalshi: 34, predictit: 38 },
    volume: "$12.8M",
    ends: "Dec 31, 2026",
  },
  {
    id: "m4",
    question: "Winner of 2026 French Presidential Election",
    category: "Politics",
    prices: { polymarket: 42, kalshi: 38, predictit: 45 },
    volume: "$8.4M",
    ends: "May 2026",
  }
];

export const NEWS_FEED: NewsItem[] = [
  { id: 1, tag: "REGULATION", title: "CFTC issues new guidance on Event Contracts", time: "2h ago" },
  { id: 2, tag: "PLATFORM", title: "Polymarket integrates Solana for faster settlement", time: "5h ago" },
  { id: 3, tag: "MARKET", title: "Arbitrage opportunity: Midterm election odds diverge", time: "8h ago" },
];

export enum TabType {
  LIVE = 'live',
  ACCURACY = 'accuracy',
  INTEGRATE = 'integrate',
  AI_INSIGHTS = 'ai-insights'
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  status: 'Operational' | 'Degraded' | 'Offline';
  accuracy: number;
  volume: string;
  delay: string;
}

export interface MarketPrice {
  polymarket?: number;
  kalshi?: number;
  predictit?: number;
  manifold?: number;
}

export interface Market {
  id: string;
  question: string;
  category: string;
  prices: MarketPrice;
  volume: string;
  ends: string;
  consensus?: number;
  arbGap?: number;
}

export interface NewsItem {
  id: number;
  tag: string;
  title: string;
  time: string;
}
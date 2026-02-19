
export enum TabType {
  HOME = 'home',
  PLATFORMS = 'platforms',
  ODDS = 'odds',
  ACCURACY = 'accuracy',
  SEARCH = 'search',
  DASHBOARD = 'dashboard'
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  type: 'centralized' | 'decentralized' | 'forecasting';
  isRealMoney: boolean;
  usFriendly: boolean;
  accuracy: number;
  brierScore: number;
  volume: string;
  feeStructure: string;
  categories: string[];
  ratings: {
    liquidity: number;
    variety: number;
    fees: number;
    ux: number;
    regulatory: number;
    beginner: number;
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
}

export interface MarketPrice {
  polymarket?: number;
  kalshi?: number;
  predictit?: number;
  manifold?: number;
  smarkets?: number;
  betfair?: number;
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
  isMatched?: boolean;
}

export interface NewsItem {
  id: number;
  tag: string;
  title: string;
  time: string;
}

export interface Position {
  id: string;
  marketId: string;
  marketQuestion: string;
  side: 'Yes' | 'No';
  amountSpent: number;
  shares: number;
  entryPrice: number;
  timestamp: number;
}

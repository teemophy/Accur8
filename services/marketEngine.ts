
import { Market } from "../types";
import { PLATFORMS } from "../constants";

export interface MarketInsight {
  title: string;
  content: string;
  type: 'opportunity' | 'alert' | 'verdict';
}

export function generateLocalInsights(markets: Market[]): MarketInsight[] {
  const insights: MarketInsight[] = [];
  
  // 1. Find Best Arbitrage / Price Gaps
  const sortedByGap = [...markets].sort((a, b) => (b.arbGap || 0) - (a.arbGap || 0));
  const topGaps = sortedByGap.slice(0, 2);

  if (topGaps.length > 0) {
    const content = topGaps.map(m => {
      const prices = Object.entries(m.prices).filter(([, v]) => v !== undefined) as [string, number][];
      const bestPrice = Math.min(...prices.map((p: [string, number]) => p[1]));
      const bestPlatform = prices.find(p => p[1] === bestPrice)?.[0] || 'Unknown';
      const platformName = PLATFORMS.find(p => p.id === bestPlatform)?.name || bestPlatform;
      
      return `• ${m.question}\n  BEST BUY: ${platformName} at ${bestPrice}%\n  SAVINGS: ${m.arbGap}% vs Market Average.`;
    }).join('\n\n');

    insights.push({
      title: "Arbitrage Alerts",
      content: content,
      type: 'opportunity'
    });
  }

  // 2. Volume & Liquidity Verdict
  const topVolume = [...markets].sort((a, b) => {
    const volA = parseFloat(a.volume.replace(/[^0-9.]/g, '')) || 0;
    const volB = parseFloat(b.volume.replace(/[^0-9.]/g, '')) || 0;
    return volB - volA;
  })[0];

  if (topVolume) {
    insights.push({
      title: "Market Leader Verdict",
      content: `High-liquidity detected in "${topVolume.question}".\n\nPolymarket currently leads in depth for this sector with ${topVolume.volume} in active volume. Spreads are tightest on centralized exchanges.`,
      type: 'verdict'
    });
  }

  // 3. Strategic Recommendation
  const highYield = markets.filter(m => (m.arbGap || 0) > 3).length;
  insights.push({
    title: "Strategic Recommendation",
    content: `Detected ${highYield} markets with >3% price divergence. \n\nStrategy: Execute "Buy Low" on ${PLATFORMS[0].name} and hedge on ${PLATFORMS[1].name} to lock in delta-neutral gains.`,
    type: 'alert'
  });

  return insights;
}

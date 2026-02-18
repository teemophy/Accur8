import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = getAIClient();
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Consensus: ${m.consensus}% | Arb: ${m.arbGap}%`
  )).join('\n');

  const prompt = `
    ROLE: Institutional Risk Analyst
    TASK: Synthesize market intelligence from the following prediction market dataset.
    
    DATASET:
    ${marketSummary}
    
    REQUIRED OUTPUT (Markdown):
    1. ARBITRAGE PRIORITY: Identify top 2 high-confidence spreads.
    2. MACRO SENTIMENT: Aggregate crowd wisdom across categories.
    3. RISK FACTORS: Highlight low-liquidity or divergent endpoints.
    
    Keep the tone professional, dense, and objective.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis engine returned empty result.";
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    throw err;
  }
}

export async function getGeminiSpecificMarketDeepDive(market: Market): Promise<string> {
  const ai = getAIClient();
  
  const pricesStr = Object.entries(market.prices)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}¢`)
    .join(', ');

  const prompt = `
    MARKET EVENT: "${market.question}"
    PLATFORM PRICING: ${pricesStr}
    AGGREGATED CONSENSUS: ${market.consensus}%
    MAX VARIANCE: ${market.arbGap}%
    
    As a prediction market specialist, provide a high-density intelligence brief (max 90 words):
    - Explain the likely cause of the ${market.arbGap}% spread (e.g. news lag, order book imbalance).
    - Rate the consensus confidence (High/Medium/Low).
    - Identify a tactical "edge" for a participant entering this market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    return response.text || "Failed to generate asset intel.";
  } catch (err) {
    console.error("Gemini Specific Error:", err);
    throw err;
  }
}
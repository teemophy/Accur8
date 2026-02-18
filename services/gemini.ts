import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = getAIClient();
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Avg: ${m.consensus}% | Difference: ${m.arbGap}% | Volume: ${m.volume}`
  )).join('\n');

  const prompt = `
    ROLE: Professional Prediction Analyst & Game Theorist
    TASK: Identify the "Best Case Participation" scenarios from the provided dataset. Focus on Expected Value (EV) and probability divergence.
    
    DATASET:
    ${marketSummary}
    
    REQUIRED OUTPUT (Markdown):
    1. HIGH-ALPHA OPPORTUNITIES: List the top 3 markets where the price difference represents a massive mispricing opportunity.
    2. THE "MOAT" ANALYSIS: Which platforms are currently lagging behind real-time news based on price spreads?
    3. BEST CASE SCENARIO: For a participant with moderate risk tolerance, describe the most mathematically sound participation strategy for the current market state.
    
    Keep the tone professional, sharp, and focused on tactical participation. Use bold headings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Neural analysis timed out.";
  } catch (err) {
    console.error("Gemini Analysis Error:", err);
    throw err;
  }
}

export async function getGeminiSpecificMarketDeepDive(market: Market): Promise<string> {
  const ai = getAIClient();
  
  const pricesStr = Object.entries(market.prices)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}%`)
    .join(', ');

  const prompt = `
    MARKET: "${market.question}"
    PRICES: ${pricesStr}
    AVG PRICE: ${market.consensus}%
    MAX SPREAD: ${market.arbGap}%
    
    In sharp, technical but readable English (max 90 words):
    - Identify the specific platform that is likely mispriced compared to the consensus.
    - Analyze the "Best Case Participation": What is the ideal entry point?
    - Risk Factor: One reason why this spread might exist beyond just "lag" (e.g. liquidity lock).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    return response.text || "Tactical scan incomplete.";
  } catch (err) {
    console.error("Gemini Specific Error:", err);
    throw err;
  }
}
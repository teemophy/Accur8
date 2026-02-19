import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = getAIClient();
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Consensus: ${m.consensus}% | Variance: ${m.arbGap}% | Volume: ${m.volume}`
  )).join('\n');

  const prompt = `
    ROLE: Tactical Prediction Aggregator Router
    TASK: Analyze the prediction market dataset to determine the "Best Execution Route" for participants. Focus on finding mispriced outcomes across platforms.
    
    DATASET:
    ${marketSummary}
    
    REQUIRED OUTPUT (Markdown):
    1. TACTICAL ENTRY POINTS: Which 3 markets represent the highest alpha participation due to platform price drift?
    2. ROUTING LOGIC: Explain why certain platforms (e.g. Polymarket vs Kalshi) are showing divergent probabilities for the same event.
    3. BEST CASE STRATEGY: Define a "Best Execution" strategy for the most liquid market currently being tracked.
    
    Keep the tone sharp, institutional, and technical. Use professional aggregator terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Routing intelligence offline.";
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
    ROUTING TARGET: "${market.question}"
    PLATFORM DISTRIBUTION: ${pricesStr}
    CONSENSUS MID: ${market.consensus}%
    MAX VARIANCE: ${market.arbGap}%
    
    In a technical brief (max 85 words):
    - Identify the specific platform that is currently "stale" or showing the best entry price.
    - Analyze the "Best Route": Is it better to participate on the most accurate platform (Polymarket) or the fastest settlement platform (Kalshi)?
    - Expected Value: Rate the Participation Confidence from 1-10.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    return response.text || "Specific routing scan failed.";
  } catch (err) {
    console.error("Gemini Specific Error:", err);
    throw err;
  }
}
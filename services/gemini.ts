
import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string | null> {
  const ai = getAI();
  if (!ai) return null;
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Mid-Price: ${m.consensus ?? 'N/A'}% | Price Difference: ${m.arbGap ?? 'N/A'}% | Volume: ${m.volume}`
  )).join('\n');

  const prompt = `
    ROLE: Prediction Market Guide
    TASK: Identify the 3 best "deals" (biggest price differences) and provide a quick verdict.
    
    DATA:
    ${marketSummary}
    
    FORMAT:
    - No asterisks.
    - Use [HEADER] format.
    - Keep it very brief.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || null;
  } catch (err) {
    console.warn("AI Analysis skipped:", err);
    return null;
  }
}

export async function getGeminiSpecificMarketDeepDive(market: Market): Promise<string | null> {
  const ai = getAI();
  if (!ai) return null;
  
  const pricesStr = Object.entries(market.prices)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}%`)
    .join(', ');

  const prompt = `
    Briefly explain the best site to buy "${market.question}" based on these prices: ${pricesStr}. 
    Max 60 words. No asterisks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || null;
  } catch (err) {
    console.warn("Deep dive skipped:", err);
    return null;
  }
}

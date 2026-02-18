import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = getAIClient();
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Avg Price: ${m.consensus}% | Difference: ${m.arbGap}%`
  )).join('\n');

  const prompt = `
    ROLE: Prediction Market Guide
    TASK: Analyze the following data and explain it in plain English for a regular user.
    
    DATASET:
    ${marketSummary}
    
    REQUIRED OUTPUT (Markdown):
    1. BEST DEALS: Point out the 3 markets with the biggest price differences between platforms.
    2. OVERALL TRENDS: What is the crowd feeling right now about Tech and Politics?
    3. TRADING TIP: Give one simple piece of advice for a new user based on this data.
    
    Keep the tone helpful, clear, and easy to understand. Avoid complex financial jargon where possible.
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
    .map(([k, v]) => `${k.toUpperCase()}: ${v}%`)
    .join(', ');

  const prompt = `
    MARKET: "${market.question}"
    PRICES: ${pricesStr}
    AVG PRICE: ${market.consensus}%
    MAX DIFFERENCE: ${market.arbGap}%
    
    In simple English (max 80 words):
    - Why is there a ${market.arbGap}% difference in prices? (e.g. maybe one platform is slower to update news).
    - How confident is the crowd (the Consensus)?
    - What is the best move for a beginner here?
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
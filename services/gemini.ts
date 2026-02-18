
import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const marketSummary = markets.map(m => (
    `- ${m.question}: Consensus ${m.consensus}%, Arb Gap ${m.arbGap}%`
  )).join('\n');

  const prompt = `
    Analyze these prediction markets:
    ${marketSummary}
    
    Briefing covering:
    1. Key Arb Ops
    2. Sentiment
    3. Strategy (Brief).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    throw error;
  }
}

export async function getGeminiSpecificMarketDeepDive(market: Market): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const pricesStr = Object.entries(market.prices).map(([k, v]) => `${k}: ${v}%`).join(', ');

  const prompt = `
    Analyze the specific prediction market: "${market.question}"
    Current spreads: ${pricesStr}
    Consensus: ${market.consensus}%
    Arb Gap: ${market.arbGap}%
    
    Provide a professional institutional-grade brief (under 100 words) on:
    - Likely reason for the spread (liquidity vs news lag).
    - Immediate risk factors.
    - Confidence rating of the consensus.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.2, // Keep it precise
      }
    });
    return response.text || "Deep dive unavailable.";
  } catch (error) {
    throw error;
  }
}

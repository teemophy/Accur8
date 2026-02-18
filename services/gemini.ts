
import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  // Fix: Directly use process.env.API_KEY for initialization as required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const marketSummary = markets.map(m => (
    `- ${m.question}: Consensus ${m.consensus}%, Arb Gap ${m.arbGap}%`
  )).join('\n');

  const prompt = `
    As a world-class financial analyst specializing in prediction markets, analyze the following real-time data from PredictHub:
    
    Current Market Snapshots:
    ${marketSummary}
    
    Provide a professional briefing covering:
    1. Key Arbitrage Opportunities: Identify where the price gaps are largest and suggest why platforms might be diverging.
    2. Sentiment Analysis: What does the consensus tell us about global expectations for these specific events?
    3. Trading Strategy: A concise, high-level recommendation for professional event traders.
    
    Keep the tone sophisticated, data-driven, and brief (max 300 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "No analysis available at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

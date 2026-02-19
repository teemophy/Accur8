
import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

// Helper function to initialize GoogleGenAI strictly using process.env.API_KEY
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getGeminiMarketAnalysis(markets: Market[]): Promise<string> {
  const ai = getAIClient();
  
  const marketSummary = markets.map(m => (
    `[${m.category}] ${m.question} | Mid-Price: ${m.consensus ?? 'N/A'}% | Price Difference: ${m.arbGap ?? 'N/A'}% | Volume: ${m.volume}`
  )).join('\n');

  const prompt = `
    ROLE: Friendly Prediction Market Guide
    TASK: Explain the current prediction market landscape to a beginner. Help them find where the "best deals" are (the biggest price differences between sites) and what to do.
    
    DATASET:
    ${marketSummary}
    
    CRITICAL FORMATTING RULE: 
    - DO NOT use asterisks (**) for bolding or any other purpose.
    - Use headers in the format [HEADER NAME] on a new line.
    - Keep sentences short and clear.
    
    REQUIRED OUTPUT STRUCTURE:
    [TOP OPPORTUNITIES]
    List 3 specific events with the biggest price differences. Tell the user which site is "cheaper" to buy on.
    
    [SIMPLE ACTION PLAN]
    Give a clear 2-step guide on how a new user can take advantage of these price differences today.
    
    [MARKET INSIGHTS]
    Why are these sites showing different prices? Explain it in plain English.
    
    TONE: Helpful, clear, and encouraging. Avoid heavy financial jargon. Use words like Deal, Savings, and Difference. No introductory or concluding conversational filler.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Scanning for market deals...";
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
    PRICES: ${pricesStr}
    CONSENSUS PRICE: ${market.consensus ?? 'N/A'}%
    BIGGEST DIFFERENCE: ${market.arbGap ?? 'N/A'}%
    
    In a friendly brief (max 90 words):
    - DO NOT use asterisks.
    - Which site has the lowest price right now?
    - Is it a good deal compared to the other sites?
    - Give one simple tip on why the user might choose one site over the other.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    return response.text || "Checking prices...";
  } catch (err) {
    console.error("Gemini Specific Error:", err);
    throw err;
  }
}

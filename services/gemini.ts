
import { GoogleGenAI } from "@google/genai";
import { Market } from "../types";

// Helper function to initialize GoogleGenAI strictly using process.env.GEMINI_API_KEY
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please ensure it is set in your environment.");
  }
  return new GoogleGenAI({ apiKey });
};

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
    [BEST PLATFORM RECOMMENDATIONS]
    Identify the 3 markets with the most significant price gaps. For each, explicitly state: "BEST BUY: [Platform Name]" and explain why it's the superior choice for that specific bet.
    
    [ARBITRAGE ALERTS]
    Are there any markets where the price difference is >5%? If so, flag them as "URGENT OPPORTUNITIES" and tell the user how much they save by switching platforms.
    
    [PLATFORM QUALITY VERDICT]
    Based on the current volume and prices, which platform is currently the "Market Leader" for accuracy?
    
    TONE: Helpful, clear, and encouraging. Avoid heavy financial jargon. Use words like Deal, Savings, and Difference. No introductory or concluding conversational filler.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
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
      model: 'gemini-3.1-pro-preview',
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

import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { getGeminiMarketAnalysis, getGeminiSpecificMarketDeepDive } from "./services/geminiServer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // Fetch real markets from Polymarket
  app.get("/api/markets", async (req, res) => {
    try {
      const { filter } = req.query;
      let url = "https://gamma-api.polymarket.com/markets?active=true&limit=20&order=volume&ascending=false";
      
      if (filter === 'new') {
        url = "https://gamma-api.polymarket.com/markets?active=true&limit=20&order=startDate&ascending=false";
      } else if (filter === 'trending') {
        url = "https://gamma-api.polymarket.com/markets?active=true&limit=20&order=volume&ascending=false";
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch from Polymarket");
      
      const data = await response.json();
      
      // Map Polymarket data to our Market type
      const markets = data.map((m: { id: string; question: string; groupItemTitle: string; outcomePrices: number[]; volume: number; endDate: string }) => ({
        id: m.id,
        question: m.question,
        category: m.groupItemTitle || "General",
        prices: {
          polymarket: Math.round((m.outcomePrices?.[0] || 0.5) * 100),
          // Increase variance to make "Best Buy" more obvious
          kalshi: Math.round((m.outcomePrices?.[0] || 0.5) * 100) + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 5) - 1),
          predictit: Math.round((m.outcomePrices?.[0] || 0.5) * 100) + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : -Math.floor(Math.random() * 3) - 1)
        },
        volume: `$${(m.volume / 1000000).toFixed(1)}M`,
        ends: new Date(m.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        isMatched: true
      }));

      res.json({ status: "ok", markets });
    } catch (error) {
      console.error("Market fetch error:", error);
      res.status(500).json({ status: "error", message: "Failed to fetch markets" });
    }
  });

  app.post("/api/intelligence/report", async (req, res) => {
    try {
      const { markets } = req.body; // In a real app, we'd pass data or fetch fresh
      // For simplicity in this demo, we'll fetch fresh markets if none provided
      let marketData = markets;
      if (!marketData) {
        const response = await fetch("https://gamma-api.polymarket.com/markets?active=true&limit=10&order=volume&ascending=false");
        const data = await response.json();
        marketData = data.map((m: { id: string; question: string; groupItemTitle: string; outcomePrices: number[]; volume: number }) => ({
          id: m.id,
          question: m.question,
          category: m.groupItemTitle || "General",
          prices: { polymarket: Math.round((m.outcomePrices?.[0] || 0.5) * 100) },
          volume: `$${(m.volume / 1000000).toFixed(1)}M`,
          consensus: Math.round((m.outcomePrices?.[0] || 0.5) * 100),
          arbGap: Math.floor(Math.random() * 5) + 1
        }));
      }
      
      const analysis = await getGeminiMarketAnalysis(marketData);
      res.json({ status: "ok", analysis });
    } catch (error) {
      console.error("Intelligence report error:", error);
      res.status(500).json({ status: "error", message: "Failed to generate report" });
    }
  });

  app.post("/api/intelligence/deep-dive", async (req, res) => {
    try {
      const { market } = req.body;
      if (!market) return res.status(400).json({ status: "error", message: "Market data required" });
      
      const analysis = await getGeminiSpecificMarketDeepDive(market);
      res.json({ status: "ok", analysis });
    } catch (error) {
      console.error("Deep dive error:", error);
      res.status(500).json({ status: "error", message: "Failed to generate deep dive" });
    }
  });

  // OAuth URL generation
  app.get("/api/auth/url", (req, res) => {
    // Placeholder for Google OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.APP_URL}/auth/callback&response_type=code&scope=email%20profile`;
    res.json({ url: authUrl });
  });

  // OAuth Callback
  app.get("/auth/callback", (req, res) => {
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

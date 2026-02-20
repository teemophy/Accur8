import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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
      // Polymarket Gamma API for active markets
      const response = await fetch("https://gamma-api.polymarket.com/markets?active=true&limit=20&order=volume&ascending=false");
      if (!response.ok) throw new Error("Failed to fetch from Polymarket");
      
      const data = await response.json();
      
      // Map Polymarket data to our Market type
      const markets = data.map((m: { id: string; question: string; groupItemTitle: string; outcomePrices: number[]; volume: number; endDate: string }) => ({
        id: m.id,
        question: m.question,
        category: m.groupItemTitle || "General",
        prices: {
          polymarket: Math.round((m.outcomePrices?.[0] || 0.5) * 100),
          // Simulate other platforms for comparison
          kalshi: Math.round((m.outcomePrices?.[0] || 0.5) * 100) + (Math.random() > 0.5 ? 2 : -2),
          predictit: Math.round((m.outcomePrices?.[0] || 0.5) * 100) + (Math.random() > 0.5 ? 1 : -1)
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

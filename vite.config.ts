
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' allows loading all envs regardless of the VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000
    },
    plugins: [react(), vercel()],
    define: {
      // Injects the API_KEY from Vercel's environment into the browser-side process.env
      // This ensures @google/genai can access the key as required.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

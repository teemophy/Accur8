import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import vercel from 'vite-plugin-vercel';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000
    },
    plugins: [react(), vercel()],
    define: {
      // Direct injection of the API_KEY into the client-side bundle
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'framer-motion', 'lucide-react']
          }
        }
      }
    }
  };
});
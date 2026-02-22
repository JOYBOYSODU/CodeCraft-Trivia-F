import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // Fix for sockjs-client using Node.js's `global` in browser context
      global: 'globalThis',
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        '/ws': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          ws: true,
        },
        '/judge0': {
          target: 'https://judge0-ce.p.rapidapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/judge0/, ''),
          headers: {
            'X-RapidAPI-Key': env.VITE_JUDGE0_KEY ?? '',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        },
      },
    },
  }
})


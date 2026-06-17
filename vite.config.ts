import type { ServerResponse } from 'node:http'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/(auth|drafts|events|upload|p|contributions|admin|wallet)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[proxy error]', err.message)
            const response = res as ServerResponse
            if (!response.headersSent) {
              response.writeHead(502)
              response.end('Bad Gateway')
            }
          })
        },
      },
    },
  },
})

import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only plugin: forwards browser console.* calls to this terminal.
// Useful when debugging on a real mobile device that has no DevTools.
// Only active during `vite dev` (apply: 'serve').
function mobileLogPlugin() {
  return {
    name: 'mobile-log',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (path: string, handler: (req: IncomingMessage, res: ServerResponse) => void) => void } }) {
      server.middlewares.use('/dev-log', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk })
        req.on('end', () => {
          try {
            const { level, args } = JSON.parse(body) as { level: string; args: string[] }
            const colors: Record<string, string> = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', log: '\x1b[37m' }
            const reset = '\x1b[0m'
            const tag = `${colors[level] ?? ''}[mobile:${level}]${reset}`
            console.log(tag, ...args)
          } catch {}
          res.writeHead(204)
          res.end()
        })
      })
    },
    transformIndexHtml() {
      return [{
        tag: 'script',
        injectTo: 'head-prepend' as const,
        children: `
(function(){
  ['log','info','warn','error'].forEach(function(level){
    var orig = console[level].bind(console);
    console[level] = function(){
      orig.apply(console, arguments);
      try {
        var args = Array.prototype.slice.call(arguments).map(function(a){
          if (a instanceof Error) return a.stack || a.message;
          try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(e) { return String(a); }
        });
        fetch('/dev-log',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({level:level,args:args})}).catch(function(){});
      } catch(e) {}
    };
  });
})();
        `,
      }]
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mobileLogPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    allowedHosts: ['frontend.celebre.fun'],
    port: 5173,
    proxy: {
      '^/(auth|drafts|events|upload|pub|contributions|admin|wallet|plans)': {
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

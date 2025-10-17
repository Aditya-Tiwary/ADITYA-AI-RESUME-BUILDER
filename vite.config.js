import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        preserveHeaderKeyCase: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request to:', proxyReq.path);
            console.log('Request cookies:', req.headers.cookie || 'none');
            
            proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
            
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
            console.log('Response cookies:', proxyRes.headers['set-cookie'] || 'none');
            
            if (proxyRes.headers['set-cookie']) {
              res.setHeader('Set-Cookie', proxyRes.headers['set-cookie']);
            }
          });
        }
      },
      '/health': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      },
      '/enhance': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
});

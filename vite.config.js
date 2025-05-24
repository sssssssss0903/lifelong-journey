import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import compression from 'vite-plugin-compression';

export default defineConfig({
  base: './',
  cacheDir: 'node_modules/.vite_cache',
  plugins: [
    react(),
    svgr(),
    compression({ algorithm: 'brotliCompress' }), 
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '/api'),
      }
    }
  },
  build: {
    target: 'esnext',
    cssTarget: 'chrome100',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
    
        entryFileNames: 'bundle.js',
        assetFileNames: 'bundle.css',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts')) return 'echarts';
            if (id.includes('react')) return 'react';
            return 'vendor';
          }
        }
      },
    },
  },
});

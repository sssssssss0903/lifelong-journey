import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [react(), svgr()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
 
      }
    }
  },
  build: {
    target: 'es2015',
    modulePreload: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        format: 'iife',
        entryFileNames: 'bundle.js',
        assetFileNames: 'bundle.css',
      },
    },
  },
});

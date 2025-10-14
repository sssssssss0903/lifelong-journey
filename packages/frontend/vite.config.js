import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import svgr from 'vite-plugin-svgr'
import viteCompression from 'vite-plugin-compression'
import path from 'path' // ✅ 必须加

// ✅ 这里不需要 import tailwindcss 或 autoprefixer
// 因为它们会自动从 postcss.config.js 加载

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    base: './',
    plugins: [
      react(),
      svgr(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
        threshold: 10240,
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
        threshold: 10240,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },

    define: {
      __APP_ENV__: env.APP_ENV,
    },
  }
})

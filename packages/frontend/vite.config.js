import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import svgr from 'vite-plugin-svgr'
import viteCompression from 'vite-plugin-compression'



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

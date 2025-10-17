import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import svgr from 'vite-plugin-svgr'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  //  插件统一管理
  const plugins = [
    react(),
    svgr(),
     visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ]

  //  仅生产环境使用压缩与图片优化
  if (isProd) {
    plugins.push(
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
      viteImagemin({
        mozjpeg: { quality: 80 },
        pngquant: { quality: [0.7, 0.9] },
        webp: { quality: 80 },
      })
    )
  }

  return {
    base: './',
    plugins,
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },

    //  开发服务器配置
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

    //  依赖预构建
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
      exclude: ['@amap/amap-jsapi-loader'], // 非首屏资源排除
    },

    // 构建优化
    build: {
      target: 'esnext', // 输出现代语法，减少 polyfill
      sourcemap: false,
      minify: 'esbuild', // 替代 Terser
      rollupOptions: {
        treeshake: true, 
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['axios', 'zustand'],
          },
        },
      },
    },
    esbuild: {
  drop: ['console', 'debugger']
},

  }
})

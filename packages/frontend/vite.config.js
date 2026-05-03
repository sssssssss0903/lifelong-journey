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

    //  依赖预构建（修复重复 include 键的 bug，合并到一个数组）
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'zustand',
        '@amap/amap-jsapi-loader', // CJS 模块需要预构建
      ],
    },

    // 构建优化
    build: {
      target: 'esnext', // 输出现代语法，减少 polyfill
      sourcemap: false,
      minify: 'esbuild', // 替代 Terser
      cssCodeSplit: true, // CSS 按 chunk 拆分，避免一份大 CSS 阻塞首屏
      assetsInlineLimit: 4096, // 4KB 以下资源 base64 内联，减少请求数
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        treeshake: true,
        output: {
          // 把重型第三方库单独拆 chunk，便于浏览器长缓存命中
          // 业务代码改动不会让 react/echarts/amap 这些大块缓存失效
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react';
              }
              if (id.includes('echarts') || id.includes('zrender')) {
                return 'charts'; // ECharts 大约 400KB，独立 chunk 懒加载场景再拉
              }
              if (id.includes('@amap') || id.includes('amap-jsapi')) {
                return 'map'; // AMap loader 单独拆，Login 页不会拉
              }
              if (id.includes('axios') || id.includes('zustand')) {
                return 'vendor';
              }
              return 'deps';
            }
          },
        },
      },
    },
    esbuild: {
  drop: ['console', 'debugger']
},

  }
})

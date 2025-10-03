import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  const isProd = mode === 'production';

  return {
    base: './',
    cacheDir: '.vite',

    plugins: [
      react(),
      svgr(),

      // gzip 压缩（.gz）
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
        threshold: 10240, // 只压缩 >10kb 文件
      }),

      // brotli 压缩（.br）
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false,
        threshold: 10240,
      }),
    ],

    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          // 如果后端不是 /api，可以按需改写
          // rewrite: p => p.replace(/^\/api/, '/backend')
        },
      },
    },

    build: {
      target: 'esnext',
      cssTarget: 'chrome100',
      sourcemap: !isProd, // 开发时保留 map, 生产去掉
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',

          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'react';
              if (id.includes('echarts')) return 'echarts';
              return 'vendor';
            }
          },
        },
      },

      // 删除 console.log 和 debugger
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : {},
    },

    define: {
      __APP_ENV__: env.APP_ENV, // 可以通过 import.meta.env.APP_ENV 使用
    },
  };
});

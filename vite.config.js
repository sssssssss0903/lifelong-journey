import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: './',  //  相对路径用于 file:// 协议加载资源
  plugins: [react(), svgr()],
  build: {
    target: 'es2015',
    modulePreload: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), //  添加入口 HTML 文件路径
      output: {
        format: 'iife', //  非模块格式，避免 CORS 问题
        entryFileNames: 'bundle.js',      // JS 输出名
        assetFileNames: 'bundle.css',     // CSS 输出名
      },
    },
  },
})

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 🧭 Lifelong Journey

记录你走过的每一程，绘制属于你的地图。
![alt text](image-1.png)

---

## 📁 项目目录结构

```text
Lifelong-Journey/
├── src/
│   ├── assets/         # 静态资源（地图、头像图等）
│   ├── App.jsx         # 路由配置入口
│   ├── Login.jsx       # 登录页
│   ├── Home.jsx        # 主页面（包含地图、标记功能）
│   ├── Sidebar.jsx     # 左侧栏组件（用户信息与统计）
│   ├── AddPanel.jsx    # 添加足迹的右侧栏面板
│   ├── styles.css      # 全局样式文件（不使用 Tailwind）
│   └── main.jsx        # React 渲染入口
├── electron/
│   └── main.cjs        # Electron 主进程入口（桌面版）
├── public/             # 公共静态资源
├── dist/               # 构建产物（自动生成）
├── vite.config.js      # Vite 配置文件
├── package.json        # 项目依赖与脚本配置
└── README.md           # 项目说明文档
```
## 📦 安装与运行

### 安装依赖

```bash
npm install
```
启动开发环境
```bash
npm run dev
```
构建生产环境前端页面
```bash
npm run build
```
🖥 打包为桌面应用
💡 本项目内含 Electron 主进程文件，可配合 electron-builder 打包为桌面客户端。

步骤示意：
```bash

npm install electron electron-builder --save-dev
```
在 package.json 添加：

```json

"main": "electron/main.cjs",
"build": {
  "appId": "com.yourcompany.lifelong",
  "asar": true,
  "files": [
    "dist",
    "electron"
  ]
}
```
然后运行：

```bash

npm run build && electron .
```